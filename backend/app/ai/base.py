from abc import ABC, abstractmethod
from typing import Any
from pydantic import BaseModel


class ArticleAnalysis(BaseModel):
    summary: str
    why_it_matters: str
    category: str
    subcategory: str
    tags: list[str]
    companies: list[str]
    models_mentioned: list[str]
    key_concepts: list[str]
    technologies: list[str]
    affected_users: list[str]
    learning_topics: list[str]
    difficulty: str
    estimated_reading_time: str
    importance_score: float
    technical_significance: float
    business_significance: float
    novelty_score: float
    industry_impact: float
    source_credibility: float


class BriefingItemAnalysis(BaseModel):
    summary: str
    why_it_matters: str
    who_should_care: list[str]
    what_to_learn: list[str]
    difficulty: str
    estimated_time: str


class DailyLearning(BaseModel):
    topic: str
    why: str
    explanation: str
    resources: list[dict]
    estimated_time: str


class AIProvider(ABC):
    @abstractmethod
    async def analyze_article(
        self, title: str, content: str, url: str, model: str
    ) -> ArticleAnalysis:
        pass

    @abstractmethod
    async def generate_briefing_item(
        self, article: dict, user_context: dict, model: str
    ) -> BriefingItemAnalysis:
        pass

    @abstractmethod
    async def generate_daily_learning(
        self, top_articles: list[dict], user_context: dict, model: str
    ) -> DailyLearning:
        pass

    @abstractmethod
    async def classify_article(
        self, title: str, content_preview: str, model: str
    ) -> dict:
        pass
