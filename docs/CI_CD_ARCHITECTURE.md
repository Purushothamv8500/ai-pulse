# CI/CD Architecture — AI Pulse

## Branch Strategy

```
feature/*  →  Pull Request  →  develop
develop    →  CI            →  (staging — future)
main       →  CI + Deploy   →  Render Production
```

## Workflows

### 1. CI (`ci.yml`)

Triggers on every push and PR to `main` or `develop`.

```
push / pull_request
       │
       ├─ backend job ──────────────────────────────────────────
       │   ├── setup Python 3.12
       │   ├── pip install -r requirements.txt
       │   ├── ruff lint (E, F, W)
       │   ├── pytest tests/
       │   └── python -c "from app.main import app"  (import check)
       │
       ├─ backend-docker job (needs: backend) ──────────────────
       │   ├── docker build backend/
       │   └── docker run → curl /health (smoke test)
       │
       └─ frontend job ─────────────────────────────────────────
           ├── npm ci
           ├── tsc --noEmit
           └── npm run build
```

### 2. Deploy (`deploy.yml`)

Triggers automatically when `CI` workflow **succeeds** on `main`.

```
CI success on main
       │
       ▼
deploy job (environment: production)
       │
       ├── 1. Run Alembic migrations (if migration files exist)
       │        cd backend && alembic upgrade head
       │
       ├── 2. Trigger Render API deployment (Render API)
       │        POST /v1/services/{RENDER_API_SERVICE_ID}/deploys
       │
       ├── 3. Poll deployment status (up to 10 minutes)
       │        GET /v1/services/{id}/deploys/{deploy_id}
       │        wait for status == "live"
       │
       ├── 4. Health check
       │        GET https://ai-pulse-api.onrender.com/health
       │        GET /health/database
       │
       ├── 5. Trigger Render Scheduler deployment
       │        POST /v1/services/{RENDER_SCHEDULER_SERVICE_ID}/deploys
       │
       └── 6. Deployment summary
```

## Required GitHub Secrets

Set in **Settings → Secrets → Actions → New repository secret**:

| Secret | Where to find |
|--------|---------------|
| `RENDER_API_KEY` | Render Dashboard → Account → API Keys |
| `RENDER_API_SERVICE_ID` | Render Dashboard URL: `srv-XXXX` in web service URL |
| `RENDER_SCHEDULER_SERVICE_ID` | Same, for the scheduler service |
| `RENDER_API_URL` | `https://ai-pulse-api.onrender.com` |
| `DATABASE_SYNC_URL` | PostgreSQL connection URL (for migration step) |
| `SECRET_KEY` | Same value set in Render env vars |
| `ANTHROPIC_API_KEY` | Optional — only if CI tests call the API |

For environment-scoped secrets (recommended):
1. Settings → Environments → New environment → `production`
2. Add required reviewers if desired
3. Scope all Render/DB secrets to this environment

## Deployment Order

The deploy workflow enforces this order:

1. **Migrations** — run before any service deploys
2. **API** — deploy first; it handles HTTP traffic
3. **Health check** — verify API is live before touching scheduler
4. **Scheduler** — deploy last (workers can be momentarily down during API deploy)

## Preventing Race Conditions

The `concurrency` block in `deploy.yml` ensures only one production deployment
runs at a time. If a new commit is pushed while a deploy is in progress, the
pending deploy queues (does not cancel the in-progress one).

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

## Disabling Auto-Deploy in Render

`render.yaml` sets `autoDeploy: false` on both services. This means:
- Pushing to `main` alone does NOT trigger Render to deploy
- Only the GitHub Actions `deploy.yml` workflow triggers Render deploys
- This ensures CI must pass before any deployment

## Adding Staging

To add a staging environment:
1. Create a `develop` branch
2. Add staging services in `render.yaml` (ai-pulse-api-staging, ai-pulse-scheduler-staging)
3. Add a `deploy-staging.yml` workflow triggered on push to `develop`
4. Add corresponding GitHub secrets scoped to a `staging` environment
