from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from datetime import date
from app.core.database import get_db
from app.api.deps import get_current_user, get_admin_user
from app.models.user import User
from app.models.briefing import Briefing, BriefingItem
from app.schemas.briefing import BriefingResponse, BriefingListResponse

router = APIRouter(prefix="/briefings", tags=["briefings"])


async def _load_briefing(db: AsyncSession, briefing: Briefing) -> Briefing:
    result = await db.execute(
        select(Briefing)
        .where(Briefing.id == briefing.id)
        .options(
            selectinload(Briefing.items).selectinload(BriefingItem.article)
        )
    )
    return result.scalar_one()


@router.get("/today", response_model=BriefingResponse)
async def get_today_briefing(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    result = await db.execute(
        select(Briefing)
        .where(Briefing.date == today, Briefing.is_published)
        .options(selectinload(Briefing.items).selectinload(BriefingItem.article))
    )
    briefing = result.scalar_one_or_none()
    if not briefing:
        raise HTTPException(status_code=404, detail="No briefing available for today yet")
    return briefing


@router.get("", response_model=BriefingListResponse)
async def list_briefings(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = await db.execute(
        select(Briefing)
        .where(Briefing.is_published)
        .order_by(desc(Briefing.date))
        .offset(offset)
        .limit(page_size)
        .options(selectinload(Briefing.items).selectinload(BriefingItem.article))
    )
    briefings = list(result.scalars().all())

    count_result = await db.execute(
        select(Briefing).where(Briefing.is_published)
    )
    total = len(count_result.scalars().all())

    return BriefingListResponse(items=briefings, total=total)


@router.get("/{briefing_id}", response_model=BriefingResponse)
async def get_briefing(
    briefing_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Briefing)
        .where(Briefing.id == briefing_id)
        .options(selectinload(Briefing.items).selectinload(BriefingItem.article))
    )
    briefing = result.scalar_one_or_none()
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return briefing


@router.post("/generate", status_code=202)
async def trigger_briefing_generation(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    from app.services.briefing_service import briefing_service
    briefing = await briefing_service.generate_daily_briefing(db)
    return {"message": "Briefing generation triggered", "briefing_id": str(briefing.id) if briefing else None}
