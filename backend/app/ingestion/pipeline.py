import hashlib
import structlog
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.ingestion.base import RawContent
from app.ingestion.rss_adapter import RSSAdapter
from app.models.source import Source
from app.models.article import Article
from app.ai.analyzer import analyzer

logger = structlog.get_logger()


class IngestionPipeline:
    def __init__(self):
        self.rss_adapter = RSSAdapter()

    async def run_all_sources(self, db: AsyncSession) -> dict:
        result = await db.execute(
            select(Source).where(Source.is_active)
        )
        sources = result.scalars().all()

        total_fetched = 0
        total_new = 0
        total_processed = 0

        for source in sources:
            feed_url = source.feed_url or source.url
            stats = await self.ingest_source(db, source, feed_url)
            total_fetched += stats["fetched"]
            total_new += stats["new"]
            total_processed += stats["processed"]

        logger.info("ingestion_complete", sources=len(sources), fetched=total_fetched, new=total_new)
        return {"sources": len(sources), "fetched": total_fetched, "new": total_new, "processed": total_processed}

    async def ingest_source(self, db: AsyncSession, source: Source, feed_url: str) -> dict:
        raw_items = await self.rss_adapter.fetch(feed_url)
        stats = {"fetched": len(raw_items), "new": 0, "processed": 0}

        for item in raw_items:
            is_new = await self._process_item(db, source, item)
            if is_new:
                stats["new"] += 1

        source.last_fetched_at = datetime.now(timezone.utc).isoformat()
        source.articles_count += stats["new"]
        await db.flush()

        return stats

    async def _process_item(self, db: AsyncSession, source: Source, item: RawContent) -> bool:
        normalized_url = self.rss_adapter.normalize_url(item.url)

        existing = await db.execute(
            select(Article).where(Article.url_normalized == normalized_url)
        )
        if existing.scalar_one_or_none():
            return False

        content_hash = hashlib.md5(f"{item.title}{item.url}".encode()).hexdigest()

        article = Article(
            source_id=source.id,
            title=item.title,
            url=item.url,
            url_normalized=normalized_url,
            content_preview=item.content[:2000] if item.content else None,
            author=item.author,
            published_at=item.published_at,
            content_hash=content_hash,
        )
        db.add(article)
        await db.flush()

        await self._run_ai_analysis(db, article, item)
        return True

    async def _run_ai_analysis(self, db: AsyncSession, article: Article, item: RawContent) -> None:
        try:
            analysis = await analyzer.analyze_article(
                title=item.title,
                content=item.content or item.title,
                url=item.url,
            )
            if not analysis:
                return

            article.is_processed = True
            article.processed_at = datetime.now(timezone.utc)
            article.ai_model_used = "anthropic"
            article.summary = analysis.summary
            article.why_it_matters = analysis.why_it_matters
            article.category = analysis.category
            article.subcategory = analysis.subcategory
            article.tags = analysis.tags
            article.companies = analysis.companies
            article.models_mentioned = analysis.models_mentioned
            article.key_concepts = analysis.key_concepts
            article.technologies = analysis.technologies
            article.affected_users = analysis.affected_users
            article.learning_topics = analysis.learning_topics
            article.difficulty = analysis.difficulty
            article.estimated_reading_time = analysis.estimated_reading_time
            article.importance_score = analysis.importance_score
            article.technical_significance = analysis.technical_significance
            article.business_significance = analysis.business_significance
            article.novelty_score = analysis.novelty_score
            article.industry_impact = analysis.industry_impact
            await db.flush()
        except Exception as e:
            logger.error("ai_analysis_failed", article_id=str(article.id), error=str(e))


pipeline = IngestionPipeline()
