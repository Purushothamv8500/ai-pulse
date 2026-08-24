import structlog
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.article import Article
from app.models.briefing import Briefing, BriefingItem
from app.ai.analyzer import analyzer

logger = structlog.get_logger()

DEFAULT_USER_CONTEXT = {
    "experience_level": "intermediate",
    "interests": ["LLMs", "AI Tools", "AI Agents"],
}


class BriefingService:
    async def generate_daily_briefing(
        self, db: AsyncSession, target_date: date | None = None
    ) -> Briefing | None:
        if target_date is None:
            target_date = date.today()

        existing = await db.execute(
            select(Briefing).where(Briefing.date == target_date)
        )
        existing_briefing = existing.scalar_one_or_none()
        if existing_briefing:
            logger.info("briefing_already_exists", date=str(target_date))
            return existing_briefing

        top_articles = await self._get_top_articles(db, target_date)

        if len(top_articles) < 3:
            logger.warning("not_enough_articles", count=len(top_articles))

        select_articles = top_articles[:10]

        daily_learning = await analyzer.generate_daily_learning(
            top_articles=[
                {"title": a.title, "summary": a.summary or "", "category": a.category or ""}
                for a in select_articles
            ],
            user_context=DEFAULT_USER_CONTEXT,
        )

        briefing = Briefing(
            date=target_date,
            title=f"AI Pulse — {target_date.strftime('%B %d, %Y')}",
            greeting=f"Good morning! Here are today's most important AI developments for {target_date.strftime('%A, %B %d')}.",
            summary=f"Today's briefing covers {len(select_articles)} key AI developments.",
            learning_topic=daily_learning.topic if daily_learning else None,
            learning_why=daily_learning.why if daily_learning else None,
            learning_explanation=daily_learning.explanation if daily_learning else None,
            learning_resources=daily_learning.resources if daily_learning else [],
            is_published=True,
            items_count=len(select_articles),
        )
        db.add(briefing)
        await db.flush()

        for i, article in enumerate(select_articles):
            item_analysis = await analyzer.generate_briefing_item(
                article={"title": article.title, "summary": article.summary or "", "category": article.category or ""},
                user_context=DEFAULT_USER_CONTEXT,
            )

            item = BriefingItem(
                briefing_id=briefing.id,
                article_id=article.id,
                position=i + 1,
                summary=item_analysis.summary if item_analysis else article.summary,
                why_it_matters=item_analysis.why_it_matters if item_analysis else article.why_it_matters,
                who_should_care=item_analysis.who_should_care if item_analysis else [],
                what_to_learn=item_analysis.what_to_learn if item_analysis else [],
                difficulty=item_analysis.difficulty if item_analysis else article.difficulty,
                estimated_time=item_analysis.estimated_time if item_analysis else article.estimated_reading_time,
            )
            db.add(item)

        await db.flush()
        logger.info("briefing_generated", date=str(target_date), items=len(select_articles))
        return briefing

    async def _get_top_articles(self, db: AsyncSession, target_date: date) -> list[Article]:
        result = await db.execute(
            select(Article)
            .where(
                Article.is_processed,
                ~Article.is_hidden,
                Article.importance_score > 0.3,
            )
            .order_by(desc(Article.importance_score), desc(Article.created_at))
            .limit(20)
        )
        return list(result.scalars().all())


briefing_service = BriefingService()
