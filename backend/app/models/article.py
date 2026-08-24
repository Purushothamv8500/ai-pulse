from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.user import UUIDType

if TYPE_CHECKING:
    from app.models.source import Source
    from app.models.briefing import BriefingItem
    from app.models.user import User
from datetime import datetime


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("sources.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(1024), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False, unique=True)
    url_normalized: Mapped[str] = mapped_column(String(2048), nullable=False, index=True)
    content_preview: Mapped[str | None] = mapped_column(Text, nullable=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    duplicate_of_id: Mapped[uuid.UUID | None] = mapped_column(UUIDType, ForeignKey("articles.id"), nullable=True)

    is_processed: Mapped[bool] = mapped_column(Boolean, default=False)
    processed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ai_model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)

    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    why_it_matters: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    companies: Mapped[list] = mapped_column(JSON, default=list)
    models_mentioned: Mapped[list] = mapped_column(JSON, default=list)
    key_concepts: Mapped[list] = mapped_column(JSON, default=list)
    technologies: Mapped[list] = mapped_column(JSON, default=list)
    affected_users: Mapped[list] = mapped_column(JSON, default=list)
    learning_topics: Mapped[list] = mapped_column(JSON, default=list)
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    estimated_reading_time: Mapped[str | None] = mapped_column(String(50), nullable=True)

    importance_score: Mapped[float] = mapped_column(Float, default=0.0)
    technical_significance: Mapped[float] = mapped_column(Float, default=0.0)
    business_significance: Mapped[float] = mapped_column(Float, default=0.0)
    novelty_score: Mapped[float] = mapped_column(Float, default=0.0)
    industry_impact: Mapped[float] = mapped_column(Float, default=0.0)

    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)

    source: Mapped["Source"] = relationship(back_populates="articles")
    duplicate_of: Mapped["Article | None"] = relationship(foreign_keys=[duplicate_of_id], remote_side="Article.id")
    saved_by: Mapped[list["SavedArticle"]] = relationship(back_populates="article")
    briefing_items: Mapped[list["BriefingItem"]] = relationship(back_populates="article")


class SavedArticle(Base):
    __tablename__ = "saved_articles"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("users.id", ondelete="CASCADE"))
    article_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("articles.id", ondelete="CASCADE"))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="saved_articles")
    article: Mapped["Article"] = relationship(back_populates="saved_by")
