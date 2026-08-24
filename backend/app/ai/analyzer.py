import structlog
from app.ai.base import AIProvider, ArticleAnalysis, BriefingItemAnalysis, DailyLearning
from app.core.config import settings

logger = structlog.get_logger()


def get_ai_provider() -> AIProvider:
    if settings.AI_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
        from app.ai.anthropic_provider import AnthropicProvider
        return AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY)
    raise ValueError("No valid AI provider configured. Set AI_PROVIDER and corresponding API key.")


class AIAnalyzer:
    def __init__(self):
        self._provider: AIProvider | None = None

    @property
    def provider(self) -> AIProvider:
        if self._provider is None:
            self._provider = get_ai_provider()
        return self._provider

    async def analyze_article(self, title: str, content: str, url: str) -> ArticleAnalysis | None:
        try:
            result = await self.provider.analyze_article(
                title=title,
                content=content,
                url=url,
                model=settings.AI_MODEL_QUALITY,
            )
            logger.info("article_analyzed", title=title[:50])
            return result
        except Exception as e:
            logger.error("article_analysis_failed", error=str(e), title=title[:50])
            return None

    async def classify_article(self, title: str, content_preview: str) -> dict | None:
        try:
            result = await self.provider.classify_article(
                title=title,
                content_preview=content_preview,
                model=settings.AI_MODEL_CHEAP,
            )
            return result
        except Exception as e:
            logger.error("classification_failed", error=str(e))
            return None

    async def generate_briefing_item(
        self, article: dict, user_context: dict
    ) -> BriefingItemAnalysis | None:
        try:
            result = await self.provider.generate_briefing_item(
                article=article,
                user_context=user_context,
                model=settings.AI_MODEL_QUALITY,
            )
            return result
        except Exception as e:
            logger.error("briefing_item_failed", error=str(e))
            return None

    async def generate_daily_learning(
        self, top_articles: list[dict], user_context: dict
    ) -> DailyLearning | None:
        try:
            result = await self.provider.generate_daily_learning(
                top_articles=top_articles,
                user_context=user_context,
                model=settings.AI_MODEL_QUALITY,
            )
            return result
        except Exception as e:
            logger.error("daily_learning_failed", error=str(e))
            return None


analyzer = AIAnalyzer()
