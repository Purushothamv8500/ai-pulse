# Render Deployment Guide — AI Pulse

## Architecture on Render

| Service | Render Type | Purpose |
|---------|-------------|---------|
| `ai-pulse-api` | Web Service (Docker) | FastAPI REST API |
| `ai-pulse-scheduler` | Background Worker (Docker) | APScheduler (ingestion + briefing) |

**No Celery, no separate Redis broker.** The scheduler runs APScheduler in a standalone
async process. Both services build from the same `backend/Dockerfile` with different
start commands.

---

## Prerequisites

- Render account at https://render.com
- GitHub repository with this project pushed
- PostgreSQL database (use Render PostgreSQL or Supabase's connection string)
- Redis instance (use Render Redis or Upstash; optional — only for health check right now)

---

## Step 1 — Create Render Account and Connect GitHub

1. Sign up at https://render.com
2. Go to **Account Settings → GitHub** and connect your GitHub account
3. Grant Render access to the `AI PULSE` repository

---

## Step 2 — Create PostgreSQL Database

**Option A — Render PostgreSQL** (simplest):
1. Render Dashboard → **New → PostgreSQL**
2. Name: `ai-pulse-db`
3. Region: Oregon (match API region)
4. Plan: Starter ($7/month)
5. After creation, copy:
   - **External Database URL** → `DATABASE_URL` (add `+asyncpg` for async)
   - **External Database URL** → `DATABASE_SYNC_URL` (as-is, no driver suffix)

Convert the external URL for Django async:
```
# External URL from Render:
postgresql://user:password@dpg-xxxx.oregon-postgres.render.com/dbname

# DATABASE_URL (add +asyncpg):
postgresql+asyncpg://user:password@dpg-xxxx.oregon-postgres.render.com/dbname

# DATABASE_SYNC_URL (no change):
postgresql://user:password@dpg-xxxx.oregon-postgres.render.com/dbname
```

**Option B — Supabase PostgreSQL**:
1. Go to your Supabase project → Settings → Database
2. Copy the **Connection string (URI)** — use Transaction Pooler for serverless
3. Same URL transformation applies

---

## Step 3 — Create Redis (Optional)

1. Render Dashboard → **New → Redis**
2. Name: `ai-pulse-redis`
3. Region: Oregon
4. Plan: Free
5. Copy the **Internal Redis URL** → use as `REDIS_URL`

Or use Upstash for free tier: https://upstash.com

---

## Step 4 — Deploy via Blueprint (render.yaml)

1. Render Dashboard → **New → Blueprint**
2. Connect your GitHub repository
3. Render detects `render.yaml` automatically
4. Click **Apply** — Render creates both services

**Before first deploy completes, set all `sync: false` env vars in the dashboard** (Step 5).

---

## Step 5 — Set Environment Variables in Render Dashboard

For each service, navigate to **Service → Environment** and set:

### ai-pulse-api — Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Random 64-char string | `openssl rand -hex 32` |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel URL |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Same as FRONTEND_URL |
| `DATABASE_URL` | `postgresql+asyncpg://...` | From Step 2 |
| `DATABASE_SYNC_URL` | `postgresql://...` | From Step 2 |
| `REDIS_URL` | `redis://...` | From Step 3 |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | From Anthropic console |
| `SMTP_HOST` | `smtp.gmail.com` | Your SMTP host |
| `SMTP_PORT` | `587` | |
| `SMTP_USERNAME` | `yourmail@gmail.com` | |
| `SMTP_PASSWORD` | App password | Gmail App Password |
| `SMTP_FROM_EMAIL` | `noreply@yourdomain.com` | |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Optional |
| `GOOGLE_REDIRECT_URI` | `https://your-api.onrender.com/api/v1/auth/google/callback` | |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Optional |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Optional |

### ai-pulse-scheduler — Required Variables

Same as API except:
- No `FRONTEND_URL`, `CORS_ORIGINS`, `GOOGLE_*` needed
- Everything else matches the API service

Render supports **Environment Groups** to share variables:
1. Dashboard → **Environment Groups → New Group**
2. Name: `ai-pulse-shared`
3. Add all shared variables there
4. In each service, click **Add Environment Group → ai-pulse-shared**

---

## Step 6 — Generate Initial Database Schema

On first deployment, `init_db()` runs `create_all` which creates all tables automatically.

For future schema changes, use Alembic:

```bash
# From your local machine with DATABASE_SYNC_URL set
cd backend
export DATABASE_SYNC_URL="postgresql://user:pass@host/db"

# Generate migration (first time)
alembic revision --autogenerate -m "initial_schema"

# Apply
alembic upgrade head
```

Commit the generated file in `alembic/versions/` to the repo.

---

## Step 7 — Verify Deployment

After deploy completes, check:

```bash
# Replace with your actual Render URL
API_URL=https://ai-pulse-api.onrender.com

# Basic health
curl $API_URL/health

# Database health
curl $API_URL/health/database

# Redis health
curl $API_URL/health/redis
```

Expected responses:
```json
{"status": "healthy", "app": "AI Pulse"}
{"status": "healthy"}
{"status": "healthy"}  // or "unavailable" if Redis not configured
```

---

## Step 8 — Connect to GitHub Actions CI/CD

See [CI_CD_ARCHITECTURE.md](CI_CD_ARCHITECTURE.md) for the full flow.

Add these **GitHub Repository Secrets** (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `RENDER_API_KEY` | Render API key (Account → API Keys) |
| `RENDER_API_SERVICE_ID` | Service ID for `ai-pulse-api` (from Render dashboard URL) |
| `RENDER_SCHEDULER_SERVICE_ID` | Service ID for `ai-pulse-scheduler` |
| `RENDER_API_URL` | `https://ai-pulse-api.onrender.com` |
| `DATABASE_SYNC_URL` | For migration step in CI |
| `SECRET_KEY` | Same as Render env var |

Add a **GitHub Environment** named `production` and scope secrets to it.

---

## Getting Service IDs

From the Render dashboard:
1. Click on your service
2. The URL will be: `https://dashboard.render.com/web/srv-XXXXXXXXXXXX`
3. `srv-XXXXXXXXXXXX` is your service ID

Or via Render API:
```bash
curl -s "https://api.render.com/v1/services?limit=20" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  | python3 -c "import sys,json; [print(s['id'], s['name']) for s in json.load(sys.stdin)['services']]"
```

---

## Render Free Tier Limitations

- Free Web Services **sleep after 15 minutes** of inactivity (cold start ~30s)
- Free Background Workers are also subject to suspension
- Use **Starter plan ($7/month)** for the scheduler to keep it running continuously
- Use **Starter plan** for the API if you need no cold starts

---

## Local Development

```bash
# Start dependencies
docker-compose -f docker-compose.dev.yml up -d

# Start API with scheduler enabled
cd backend
cp .env.example .env   # edit with your values
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Or run scheduler standalone (in separate terminal)
ENABLE_SCHEDULER=true python -m app.workers.scheduler_runner
```
