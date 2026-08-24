from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.article import Article, SavedArticle
from app.schemas.article import ArticleResponse, ArticleListResponse

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=ArticleListResponse)
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: str | None = None,
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = select(Article).where(Article.is_processed, ~Article.is_hidden)

    if category:
        query = query.where(Article.category == category)
    if search:
        query = query.where(
            or_(
                Article.title.ilike(f"%{search}%"),
                Article.summary.ilike(f"%{search}%"),
            )
        )

    offset = (page - 1) * page_size
    result = await db.execute(
        query.order_by(desc(Article.importance_score), desc(Article.created_at))
        .offset(offset)
        .limit(page_size)
    )
    articles = list(result.scalars().all())

    count_result = await db.execute(query)
    total = len(count_result.scalars().all())

    return ArticleListResponse(
        items=articles,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.post("/{article_id}/save", status_code=201)
async def save_article(
    article_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == user.id,
            SavedArticle.article_id == article_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already saved"}

    saved = SavedArticle(user_id=user.id, article_id=article_id)
    db.add(saved)
    await db.flush()
    return {"message": "Article saved"}


@router.delete("/{article_id}/save")
async def unsave_article(
    article_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == user.id,
            SavedArticle.article_id == article_id,
        )
    )
    saved = result.scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.flush()
    return {"message": "Article unsaved"}


@router.get("/saved/list", response_model=list[ArticleResponse])
async def list_saved_articles(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Article)
        .join(SavedArticle, SavedArticle.article_id == Article.id)
        .where(SavedArticle.user_id == user.id)
        .order_by(desc(SavedArticle.created_at))
    )
    return list(result.scalars().all())
