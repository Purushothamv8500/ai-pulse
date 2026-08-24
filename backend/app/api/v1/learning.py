from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, timezone
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.learning import LearningTopic, LearningProgress

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/topics")
async def list_topics(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LearningTopic).where(LearningTopic.is_active).order_by(LearningTopic.title)
    )
    return list(result.scalars().all())


@router.get("/progress")
async def get_progress(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LearningProgress)
        .where(LearningProgress.user_id == user.id)
        .order_by(desc(LearningProgress.created_at))
    )
    return list(result.scalars().all())


@router.post("/{topic_id}/start", status_code=201)
async def start_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == user.id,
            LearningProgress.topic_id == topic_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already started"}

    progress = LearningProgress(
        user_id=user.id,
        topic_id=topic_id,
        status="started",
        progress_percent=0,
    )
    db.add(progress)
    await db.flush()
    return {"message": "Topic started"}


@router.post("/{topic_id}/complete")
async def complete_topic(
    topic_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(LearningProgress).where(
            LearningProgress.user_id == user.id,
            LearningProgress.topic_id == topic_id,
        )
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = LearningProgress(
            user_id=user.id,
            topic_id=topic_id,
        )
        db.add(progress)

    progress.status = "completed"
    progress.progress_percent = 100
    progress.completed_at = datetime.now(timezone.utc)
    await db.flush()
    return {"message": "Topic completed"}
