import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import router
from app.workers.scheduler import start_scheduler, stop_scheduler

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("startup", app=settings.APP_NAME, env=settings.APP_ENV)
    await init_db()
    await _seed_default_sources()
    if settings.ENABLE_SCHEDULER:
        start_scheduler()
        logger.info("scheduler_enabled")
    else:
        logger.info("scheduler_disabled", reason="ENABLE_SCHEDULER=false")
    yield
    if settings.ENABLE_SCHEDULER:
        stop_scheduler()
    logger.info("shutdown")


app = FastAPI(
    title="AI Pulse API",
    description="Personalized AI intelligence and learning platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "healthy", "app": settings.APP_NAME}


@app.get("/health/database")
async def health_database():
    from app.core.database import engine
    from sqlalchemy import text
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy"}
    except Exception as exc:
        logger.error("db_health_check_failed", error=str(exc))
        return {"status": "unhealthy", "detail": "Database not reachable"}


@app.get("/health/redis")
async def health_redis():
    import redis.asyncio as aioredis
    try:
        client = aioredis.from_url(settings.REDIS_URL, socket_timeout=2)
        await client.ping()
        await client.aclose()
        return {"status": "healthy"}
    except Exception as exc:
        logger.warning("redis_health_check_failed", error=str(exc))
        return {"status": "unavailable", "detail": "Redis not reachable"}


async def _seed_default_sources():
    from app.core.database import AsyncSessionLocal
    from app.models.source import Source
    from sqlalchemy import select

    default_sources = [
        {"name": "The Verge AI", "url": "https://www.theverge.com/ai-artificial-intelligence", "feed_url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "credibility": "high", "credibility_score": 0.8},
        {"name": "MIT Technology Review AI", "url": "https://www.technologyreview.com/topic/artificial-intelligence/", "feed_url": "https://www.technologyreview.com/feed/", "credibility": "very_high", "credibility_score": 0.95, "is_primary": True},
        {"name": "VentureBeat AI", "url": "https://venturebeat.com/category/ai/", "feed_url": "https://venturebeat.com/category/ai/feed/", "credibility": "high", "credibility_score": 0.8},
        {"name": "Towards Data Science", "url": "https://towardsdatascience.com", "feed_url": "https://towardsdatascience.com/feed", "credibility": "medium", "credibility_score": 0.65},
        {"name": "Hugging Face Blog", "url": "https://huggingface.co/blog", "feed_url": "https://huggingface.co/blog/feed.xml", "credibility": "very_high", "credibility_score": 0.95, "is_primary": True},
        {"name": "OpenAI Blog", "url": "https://openai.com/blog", "feed_url": "https://openai.com/blog/rss.xml", "credibility": "very_high", "credibility_score": 0.98, "is_primary": True},
        {"name": "Anthropic News", "url": "https://www.anthropic.com/news", "feed_url": "https://www.anthropic.com/rss.xml", "credibility": "very_high", "credibility_score": 0.98, "is_primary": True},
        {"name": "Google AI Blog", "url": "https://ai.googleblog.com", "feed_url": "https://ai.googleblog.com/feeds/posts/default", "credibility": "very_high", "credibility_score": 0.95, "is_primary": True},
        {"name": "AI News", "url": "https://www.artificialintelligence-news.com", "feed_url": "https://www.artificialintelligence-news.com/feed/", "credibility": "medium", "credibility_score": 0.6},
        {"name": "Papers With Code", "url": "https://paperswithcode.com", "feed_url": "https://paperswithcode.com/rss.xml", "credibility": "high", "credibility_score": 0.85, "is_primary": True},
    ]

    async with AsyncSessionLocal() as db:
        for src_data in default_sources:
            existing = await db.execute(select(Source).where(Source.url == src_data["url"]))
            if not existing.scalar_one_or_none():
                source = Source(**src_data)
                db.add(source)
        await db.commit()
        logger.info("default_sources_seeded")
