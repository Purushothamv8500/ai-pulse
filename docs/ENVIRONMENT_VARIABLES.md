# Environment Variables — AI Pulse

## Summary

| Variable | API | Scheduler | Required | Default |
|----------|-----|-----------|----------|---------|
| `APP_ENV` | ✓ | ✓ | yes | `development` |
| `SECRET_KEY` | ✓ | ✓ | **yes** | — |
| `DEBUG` | ✓ | ✓ | no | `false` |
| `FRONTEND_URL` | ✓ | ✓ | yes | `http://localhost:3000` |
| `CORS_ORIGINS` | ✓ | — | no | derived from FRONTEND_URL |
| `ENABLE_SCHEDULER` | `false` | `true` | yes | `true` |
| `WEB_CONCURRENCY` | ✓ | — | no | `1` |
| `DATABASE_URL` | ✓ | ✓ | **yes** | SQLite |
| `DATABASE_SYNC_URL` | ✓ | ✓ | **yes** | SQLite |
| `REDIS_URL` | ✓ | ✓ | no | `redis://localhost:6379/0` |
| `ANTHROPIC_API_KEY` | ✓ | ✓ | yes | — |
| `OPENAI_API_KEY` | ✓ | ✓ | no | — |
| `AI_PROVIDER` | ✓ | ✓ | no | `anthropic` |
| `AI_MODEL_CHEAP` | ✓ | ✓ | no | `claude-haiku-4-5-20251001` |
| `AI_MODEL_QUALITY` | ✓ | ✓ | no | `claude-sonnet-4-6` |
| `SMTP_HOST` | ✓ | ✓ | yes | `smtp.gmail.com` |
| `SMTP_PORT` | ✓ | ✓ | no | `587` |
| `SMTP_USERNAME` | ✓ | ✓ | yes | — |
| `SMTP_PASSWORD` | ✓ | ✓ | yes | — |
| `SMTP_FROM_EMAIL` | ✓ | ✓ | no | `noreply@aipulse.ai` |
| `SMTP_FROM_NAME` | ✓ | ✓ | no | `AI Pulse` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✓ | — | no | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | ✓ | — | no | `30` |
| `GOOGLE_CLIENT_ID` | ✓ | — | no | — |
| `GOOGLE_CLIENT_SECRET` | ✓ | — | no | — |
| `GOOGLE_REDIRECT_URI` | ✓ | — | no | `http://localhost:8000/...` |
| `SUPABASE_URL` | ✓ | — | no | — |
| `SUPABASE_PUBLISHABLE_KEY` | ✓ | — | no | — |
| `SUPABASE_SERVICE_ROLE_KEY` | — | — | no | — |
| `INGESTION_INTERVAL_HOURS` | ✓ | ✓ | no | `6` |
| `BRIEFING_GENERATION_HOUR` | ✓ | ✓ | no | `7` |
| `BRIEFING_GENERATION_MINUTE` | ✓ | ✓ | no | `0` |
| `RATE_LIMIT_PER_MINUTE` | ✓ | — | no | `60` |

---

## Variable Descriptions

### Application

**`APP_ENV`**
Environment name. Set to `production` on Render.

**`SECRET_KEY`**
JWT signing secret. Minimum 32 characters. Generate with:
```bash
openssl rand -hex 32
```
Never share or commit this value.

**`DEBUG`**
Set to `false` in production. When `true`, enables `/api/docs` and `/api/redoc`.

**`ENABLE_SCHEDULER`**
Controls whether APScheduler starts inside the process.
- `api` service: `false` — the API does NOT run scheduled jobs
- `scheduler` service: `true` — the Background Worker runs all scheduled jobs

**`WEB_CONCURRENCY`**
Number of uvicorn worker processes for the API. Default `1`.
Increase to `2` on Render Starter plan if you need more throughput.
Do NOT increase beyond `1` if APScheduler is enabled in the same process.

**`CORS_ORIGINS`**
Comma-separated list of allowed request origins.
Example: `https://aipulse.vercel.app,https://app.aipulse.ai`
Leave empty to auto-derive from `FRONTEND_URL` + `http://localhost:3000`.

### Database

**`DATABASE_URL`**
Async database connection URL.
- Local: `sqlite+aiosqlite:///./aipulse.db`
- Production: `postgresql+asyncpg://user:pass@host:5432/dbname`

**`DATABASE_SYNC_URL`**
Synchronous connection URL used by Alembic migrations only.
- Local: `sqlite:///./aipulse.db`
- Production: `postgresql://user:pass@host:5432/dbname`

For Render PostgreSQL, use the **External Database URL** (not Internal) unless
the services are in the same Render private network.

For Supabase, use the **Transaction Pooler** connection string for
containerized deployments (avoids connection exhaustion).

### AI

**`AI_PROVIDER`**
Primary AI provider. Currently `anthropic`. `openai` support is available but not wired in.

**`AI_MODEL_CHEAP`**
Model used for high-volume, low-cost tasks (article categorization, tagging).

**`AI_MODEL_QUALITY`**
Model used for briefing generation and high-quality summarization.

### Email

All SMTP variables are required for email functionality (verification, briefings).

For **Gmail**:
1. Enable 2-Factor Authentication
2. Generate an App Password: myaccount.google.com/apppasswords
3. Use that App Password as `SMTP_PASSWORD`

For **other providers** (SendGrid, Mailgun, Postmark):
- Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` accordingly

### Scheduler

**`INGESTION_INTERVAL_HOURS`**
How often to fetch new articles from all RSS sources. Default: every 6 hours.

**`BRIEFING_GENERATION_HOUR`** / **`BRIEFING_GENERATION_MINUTE`**
UTC time to generate the daily briefing. Default: 07:00 UTC.
Adjust for your target audience's timezone.

### Google OAuth

Set `GOOGLE_REDIRECT_URI` to:
```
https://your-api.onrender.com/api/v1/auth/google/callback
```
And add this exact URI to your Google OAuth consent screen → Authorized redirect URIs.

### Supabase

`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are only needed if you use Supabase
for social auth (`/api/v1/auth/supabase` endpoint). The `SERVICE_ROLE_KEY` is
not currently used server-side.

---

## Security Rules

1. Never commit `.env` to version control
2. Never include `SECRET_KEY`, passwords, or API keys in `render.yaml`
3. Never log env var values (structlog is configured to avoid this)
4. `SUPABASE_SERVICE_ROLE_KEY` must never be sent to the frontend
5. Rotate `SECRET_KEY` by deploying a new value — all existing JWT tokens will be invalidated
