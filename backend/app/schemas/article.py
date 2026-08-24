from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime


class ArticleResponse(BaseModel):
    id: uuid.UUID
    title: str
    url: str
    summary: Optional[str]
    why_it_matters: Optional[str]
    category: Optional[str]
    subcategory: Optional[str]
    tags: list[str]
    companies: list[str]
    models_mentioned: list[str]
    key_concepts: list[str]
    affected_users: list[str]
    learning_topics: list[str]
    difficulty: Optional[str]
    estimated_reading_time: Optional[str]
    importance_score: float
    published_at: Optional[datetime]
    source_id: uuid.UUID
    is_processed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    items: list[ArticleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ArticleFeedbackRequest(BaseModel):
    rating: int
    comment: Optional[str] = None
