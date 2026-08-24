from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Boolean, Text, Integer, ForeignKey, DateTime, Date, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.user import UUIDType
from datetime import date, datetime

if TYPE_CHECKING:
    from app.models.article import Article
    from app.models.user import User


class Briefing(Base):
    __tablename__ = "briefings"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    date: Mapped[date] = mapped_column(Date, nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    greeting: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_topic: Mapped[str | None] = mapped_column(String(255), nullable=True)
    learning_why: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    learning_resources: Mapped[list] = mapped_column(JSON, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    items_count: Mapped[int] = mapped_column(Integer, default=0)

    items: Mapped[list["BriefingItem"]] = relationship(back_populates="briefing", order_by="BriefingItem.position")
    user_briefings: Mapped[list["UserBriefing"]] = relationship(back_populates="briefing")


class BriefingItem(Base):
    __tablename__ = "briefing_items"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    briefing_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("briefings.id", ondelete="CASCADE"))
    article_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("articles.id"))
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    why_it_matters: Mapped[str | None] = mapped_column(Text, nullable=True)
    who_should_care: Mapped[list] = mapped_column(JSON, default=list)
    what_to_learn: Mapped[list] = mapped_column(JSON, default=list)
    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    estimated_time: Mapped[str | None] = mapped_column(String(50), nullable=True)

    briefing: Mapped["Briefing"] = relationship(back_populates="items")
    article: Mapped["Article"] = relationship(back_populates="briefing_items")


class UserBriefing(Base):
    __tablename__ = "user_briefings"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("users.id", ondelete="CASCADE"))
    briefing_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("briefings.id"))
    email_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    email_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    opened_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship(back_populates="briefings")
    briefing: Mapped["Briefing"] = relationship(back_populates="user_briefings")
