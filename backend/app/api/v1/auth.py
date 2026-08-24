import secrets
import httpx
from urllib.parse import urlencode
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, create_verification_token, create_password_reset_token, decode_token
from app.services.email_service import email_service
from app.core.config import settings
from app.models.user import User, UserPreferences
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        is_verified=False,
    )
    db.add(user)
    await db.flush()

    prefs = UserPreferences(user_id=user.id)
    db.add(prefs)
    await db.flush()

    token = create_verification_token(str(user.id), user.email)
    # Send email in background so the response is returned immediately
    background_tasks.add_task(
        email_service.send_verification_email, user.email, user.full_name, token
    )

    return {"message": "verification_email_sent", "email": user.email}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account inactive")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="email_not_verified")

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "email_verification":
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        return {"message": "already_verified"}

    user.is_verified = True
    await db.flush()
    return {"message": "verified", "email": user.email}


@router.post("/forgot-password")
async def forgot_password(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    body = await request.json()
    email = body.get("email", "").strip().lower()

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user and user.is_verified:
        token = create_password_reset_token(str(user.id), user.email)
        background_tasks.add_task(
            email_service.send_password_reset_email, user.email, user.full_name, token
        )

    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    token = body.get("token", "")
    new_password = body.get("new_password", "")

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    payload = decode_token(token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(new_password)
    await db.flush()
    return {"message": "Password updated successfully"}


@router.post("/resend-verification")
async def resend_verification(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    body = await request.json()
    email = body.get("email", "").strip().lower()

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user and not user.is_verified:
        token = create_verification_token(str(user.id), user.email)
        background_tasks.add_task(
            email_service.send_verification_email, user.email, user.full_name, token
        )

    return {"message": "verification_email_sent"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    token_data = decode_token(payload.refresh_token)
    if not token_data or token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == token_data["sub"]))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token(str(user.id))
    refresh_token_new = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token_new)


# ── Google OAuth (Supabase-based) ─────────────────────────────────────────────

@router.post("/supabase")
async def supabase_auth(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a verified Supabase access token for AI Pulse JWT tokens."""
    body = await request.json()
    supabase_token = body.get("access_token")

    if not supabase_token:
        raise HTTPException(status_code=400, detail="access_token required")

    supabase_url = settings.SUPABASE_URL
    if not supabase_url:
        raise HTTPException(status_code=501, detail="Supabase not configured")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{supabase_url}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {supabase_token}",
                "apikey": settings.SUPABASE_PUBLISHABLE_KEY or "",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Supabase token")

    user_data = resp.json()
    email = user_data.get("email")
    meta = user_data.get("user_metadata", {})
    full_name = (
        meta.get("full_name") or meta.get("name") or (email.split("@")[0] if email else "User")
    )

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Supabase")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    is_new_user = user is None

    if is_new_user:
        user = User(
            email=email,
            hashed_password="",
            full_name=full_name,
            is_verified=True,
        )
        db.add(user)
        await db.flush()
        prefs = UserPreferences(user_id=user.id)
        db.add(prefs)
        await db.flush()
        # Send welcome email for new Google OAuth signups in the background
        background_tasks.add_task(email_service.send_welcome_email, user.email, user.full_name)

    access_token = create_access_token(str(user.id))
    refresh_token_val = create_refresh_token(str(user.id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token_val,
        "onboarding_complete": user.onboarding_complete,
    }


# ── Legacy backend Google OAuth (kept for compatibility) ──────────────────────

@router.get("/google")
async def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": secrets.token_urlsafe(16),
    }
    url = f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    return RedirectResponse(url=url)


@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange code with Google")

    token_data = token_response.json()
    google_access_token = token_data.get("access_token")

    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {google_access_token}"},
        )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")

    google_user = userinfo_response.json()
    email = google_user.get("email")
    full_name = google_user.get("name", email.split("@")[0] if email else "User")

    if not email:
        raise HTTPException(status_code=400, detail="Could not get email from Google")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            hashed_password="",
            full_name=full_name,
            is_verified=True,
        )
        db.add(user)
        await db.flush()
        prefs = UserPreferences(user_id=user.id)
        db.add(prefs)
        await db.flush()

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    redirect_url = (
        f"{settings.FRONTEND_URL}/auth/callback"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
        f"&onboarding={'false' if user.onboarding_complete else 'true'}"
    )
    return RedirectResponse(url=redirect_url)
