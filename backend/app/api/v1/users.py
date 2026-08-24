from datetime import date, datetime
from fastapi import Request
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.api.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.models.user import User, UserPreferences
from app.models.source import Source
from app.models.article import Article
from app.models.briefing import Briefing
from app.schemas.user import UserResponse, UserPreferencesResponse, UpdateProfileRequest, UpdatePreferencesRequest, OnboardingRequest

router = APIRouter(tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserResponse)
async def update_me(
    payload: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if payload.full_name:
        user.full_name = payload.full_name
    if payload.email:
        user.email = payload.email
    await db.flush()
    return user


@router.get("/preferences", response_model=UserPreferencesResponse)
async def get_preferences(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == user.id))
    prefs = result.scalar_one_or_none()
    if not prefs:
        prefs = UserPreferences(user_id=user.id)
        db.add(prefs)
        await db.flush()
    return prefs


@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    payload: UpdatePreferencesRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == user.id))
    prefs = result.scalar_one_or_none()
    if not prefs:
        prefs = UserPreferences(user_id=user.id)
        db.add(prefs)

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(prefs, field, value)
    await db.flush()
    return prefs


@router.post("/change-password")
async def change_password(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    body = await request.json()
    current_password = body.get("current_password", "")
    new_password = body.get("new_password", "")

    if not user.hashed_password:
        raise HTTPException(status_code=400, detail="Password change not available for social login accounts")

    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    user.hashed_password = hash_password(new_password)
    await db.flush()
    return {"message": "Password updated"}


@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())

    # Active sources count
    sources_result = await db.execute(
        select(func.count()).select_from(Source).where(Source.is_active == True)
    )
    active_sources = sources_result.scalar() or 0

    # Today's articles
    articles_result = await db.execute(
        select(func.count()).select_from(Article).where(
            Article.created_at >= today_start
        )
    )
    today_articles = articles_result.scalar() or 0

    # High-signal articles today (importance >= 0.6)
    high_signal_result = await db.execute(
        select(func.count()).select_from(Article).where(
            and_(Article.created_at >= today_start, Article.importance_score >= 0.6)
        )
    )
    high_signal = high_signal_result.scalar() or 0

    # Today's briefing status
    briefing_result = await db.execute(
        select(Briefing).where(Briefing.date == today).limit(1)
    )
    briefing = briefing_result.scalar_one_or_none()

    briefing_status = "none"
    briefing_items = 0
    if briefing:
        briefing_status = "ready" if briefing.is_published else "generating"
        briefing_items = briefing.items_count or 0

    # User preferences
    prefs_result = await db.execute(
        select(UserPreferences).where(UserPreferences.user_id == user.id)
    )
    prefs = prefs_result.scalar_one_or_none()

    return {
        "active_sources": active_sources,
        "today_articles": today_articles,
        "high_signal_today": high_signal,
        "briefing_status": briefing_status,
        "briefing_items": briefing_items,
        "experience_level": prefs.experience_level if prefs else None,
        "onboarding_complete": user.onboarding_complete,
    }


@router.post("/onboarding", response_model=UserResponse)
async def complete_onboarding(
    payload: OnboardingRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == user.id))
    prefs = result.scalar_one_or_none()
    if not prefs:
        prefs = UserPreferences(user_id=user.id)
        db.add(prefs)

    prefs.experience_level = payload.experience_level
    prefs.interests = payload.interests
    prefs.reading_time = payload.reading_time
    prefs.delivery_hour = payload.delivery_hour
    prefs.delivery_minute = payload.delivery_minute
    prefs.timezone = payload.timezone
    user.onboarding_complete = True
    await db.flush()
    return user
