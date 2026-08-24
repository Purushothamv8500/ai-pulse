from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import date, datetime
from app.schemas.article import ArticleResponse


class BriefingItemResponse(BaseModel):
    id: uuid.UUID
    position: int
    summary: Optional[str]
    why_it_matters: Optional[str]
    who_should_care: list[str]
    what_to_learn: list[str]
    difficulty: Optional[str]
    estimated_time: Optional[str]
    article: ArticleResponse

    class Config:
        from_attributes = True


class BriefingResponse(BaseModel):
    id: uuid.UUID
    date: date
    title: str
    greeting: Optional[str]
    summary: Optional[str]
    learning_topic: Optional[str]
    learning_why: Optional[str]
    learning_explanation: Optional[str]
    learning_resources: list[dict]
    is_published: bool
    items_count: int
    items: list[BriefingItemResponse]
    created_at: datetime

    class Config:
        from_attributes = True


class BriefingListResponse(BaseModel):
    items: list[BriefingResponse]
    total: int
