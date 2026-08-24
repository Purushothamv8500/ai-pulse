from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.source import Source
from app.models.article import Article
from app.models.briefing import Briefing
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])


class SourceCreate(BaseModel):
    name: str
    url: str
    feed_url: str | None = None
    source_type: str = "rss"
    credibility: str = "medium"
    credibility_score: float = 0.5
    is_primary: bool = False
    description: str | None = None
    fetch_interval_hours: int = 6


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    users_count = await db.scalar(select(func.count(User.id)))
    articles_count = await db.scalar(select(func.count(Article.id)))
    processed_count = await db.scalar(select(func.count(Article.id)).where(Article.is_processed == True))
    briefings_count = await db.scalar(select(func.count(Briefing.id)))
    sources_count = await db.scalar(select(func.count(Source.id)))

    return {
        "users": users_count,
        "articles": articles_count,
        "processed_articles": processed_count,
        "briefings": briefings_count,
        "sources": sources_count,
    }


@router.get("/sources")
async def list_sources(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(Source).order_by(Source.name))
    return list(result.scalars().all())


@router.post("/sources", status_code=201)
async def create_source(
    payload: SourceCreate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    source = Source(**payload.model_dump())
    db.add(source)
    await db.flush()
    return source


@router.patch("/sources/{source_id}/toggle")
async def toggle_source(
    source_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(select(Source).where(Source.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    source.is_active = not source.is_active
    await db.flush()
    return {"id": str(source.id), "is_active": source.is_active}


@router.post("/ingestion/trigger", status_code=202)
async def trigger_ingestion(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    from app.ingestion.pipeline import pipeline
    stats = await pipeline.run_all_sources(db)
    return {"message": "Ingestion triggered", **stats}


@router.get("/articles")
async def list_articles(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(Article).order_by(desc(Article.created_at)).limit(100)
    )
    return list(result.scalars().all())
