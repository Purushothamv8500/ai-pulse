import uuid
from sqlalchemy import String, Boolean, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy import types
from app.core.database import Base
import enum


# Cross-database UUID type
class UUIDType(types.TypeDecorator):
    impl = types.String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return uuid.UUID(value)


class ExperienceLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)

    preferences: Mapped["UserPreferences"] = relationship(back_populates="user", uselist=False)
    briefings: Mapped[list["UserBriefing"]] = relationship(back_populates="user")
    saved_articles: Mapped[list["SavedArticle"]] = relationship(back_populates="user")
    learning_progress: Mapped[list["LearningProgress"]] = relationship(back_populates="user")


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUIDType, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    experience_level: Mapped[str] = mapped_column(String(50), default="intermediate")
    interests: Mapped[list] = mapped_column(JSON, default=list)
    reading_time: Mapped[str] = mapped_column(String(10), default="15")
    delivery_hour: Mapped[int] = mapped_column(Integer, default=7)
    delivery_minute: Mapped[int] = mapped_column(Integer, default=0)
    timezone: Mapped[str] = mapped_column(String(100), default="UTC")
    email_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    email_frequency: Mapped[str] = mapped_column(String(20), default="daily")

    user: Mapped["User"] = relationship(back_populates="preferences")
