from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, Text, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.user import UUIDType

if TYPE_CHECKING:
    from app.models.user import User
from datetime import datetime


class LearningTopic(Base):
    __tablename__ = "learning_topics"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    difficulty: Mapped[str] = mapped_column(String(50), default="intermediate")
    estimated_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    prerequisites: Mapped[list] = mapped_column(JSON, default=list)
    tags: Mapped[list] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    resources: Mapped[list["LearningResource"]] = relationship(back_populates="topic")
    progress: Mapped[list["LearningProgress"]] = relationship(back_populates="topic")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("learning_topics.id"))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    resource_type: Mapped[str] = mapped_column(String(50), default="article")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_free: Mapped[bool] = mapped_column(Boolean, default=True)
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)

    topic: Mapped["LearningTopic"] = relationship(back_populates="resources")


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("users.id", ondelete="CASCADE"))
    topic_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("learning_topics.id"))
    status: Mapped[str] = mapped_column(String(50), default="started")
    progress_percent: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="learning_progress")
    topic: Mapped["LearningTopic"] = relationship(back_populates="progress")
