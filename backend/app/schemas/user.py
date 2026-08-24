from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
from datetime import datetime


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    is_active: bool
    is_admin: bool
    onboarding_complete: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserPreferencesResponse(BaseModel):
    experience_level: str
    interests: list[str]
    reading_time: str
    delivery_hour: int
    delivery_minute: int
    timezone: str
    email_enabled: bool
    email_frequency: str

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UpdatePreferencesRequest(BaseModel):
    experience_level: Optional[str] = None
    interests: Optional[list[str]] = None
    reading_time: Optional[str] = None
    delivery_hour: Optional[int] = None
    delivery_minute: Optional[int] = None
    timezone: Optional[str] = None
    email_enabled: Optional[bool] = None
    email_frequency: Optional[str] = None


class OnboardingRequest(BaseModel):
    experience_level: str
    interests: list[str]
    reading_time: str
    delivery_hour: int = 7
    delivery_minute: int = 0
    timezone: str = "UTC"
