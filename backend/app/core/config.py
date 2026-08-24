from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "AI Pulse"
    APP_ENV: str = "development"
    SECRET_KEY: str
    DEBUG: bool = False
    FRONTEND_URL: str = "http://localhost:3000"

    # Comma-separated list of allowed CORS origins (overrides FRONTEND_URL when set)
    CORS_ORIGINS: str = ""

    # Set to false in the API service; true in the scheduler service
    ENABLE_SCHEDULER: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./aipulse.db"
    DATABASE_SYNC_URL: str = "sqlite:///./aipulse.db"

    REDIS_URL: str = "redis://localhost:6379/0"

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    ANTHROPIC_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    AI_PROVIDER: str = "anthropic"
    AI_MODEL_CHEAP: str = "claude-haiku-4-5-20251001"
    AI_MODEL_QUALITY: str = "claude-sonnet-4-6"

    # Email — set RESEND_API_KEY for reliable delivery (recommended for cloud deployments)
    # Alternatively configure SMTP_USERNAME + SMTP_PASSWORD for Gmail/other SMTP
    RESEND_API_KEY: str = ""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "onboarding@resend.dev"
    SMTP_FROM_NAME: str = "AI Pulse"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    INGESTION_INTERVAL_HOURS: int = 6
    BRIEFING_GENERATION_HOUR: int = 7
    BRIEFING_GENERATION_MINUTE: int = 0

    RATE_LIMIT_PER_MINUTE: int = 60

    # Concurrency — number of uvicorn worker processes
    WEB_CONCURRENCY: int = 1

    # Supabase (optional — used for auth sync and future integrations)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_PUBLISHABLE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    def get_cors_origins(self) -> list[str]:
        """Return parsed CORS allowed origins."""
        if self.CORS_ORIGINS:
            return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
        origins = [self.FRONTEND_URL]
        if "localhost" not in self.FRONTEND_URL:
            origins.append("http://localhost:3000")
        return origins

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
