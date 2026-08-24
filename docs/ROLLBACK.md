# Rollback Guide — AI Pulse

## Identifying Deployments

Every deployment is traceable. In Render Dashboard:
- Service → **Deploys** tab shows all deployments with commit SHA, timestamp, status

In GitHub:
- Actions → **Deploy to Production** run history shows which commit triggered each deploy

---

## Rollback: API Service

### Option A — Render Dashboard (fastest)

1. Render Dashboard → `ai-pulse-api` → **Deploys**
2. Find the last successful deployment
3. Click **Redeploy** on that entry

Render redeploys the exact Docker image from that deployment.
Takes ~2-3 minutes.

### Option B — Git Revert + Redeploy

If the rollback needs to be permanent (e.g., bad code committed):

```bash
# Revert the bad commit
git revert <bad-commit-sha>
git push origin main

# CI runs automatically; deploy triggers on CI success
```

### Option C — Render API

```bash
# List recent deploys for the service
curl -s "https://api.render.com/v1/services/${RENDER_API_SERVICE_ID}/deploys?limit=5" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  | python3 -c "import sys,json; [print(d['id'], d['status'], d['commit']['id'][:8]) for d in json.load(sys.stdin)]"

# Redeploy a specific commit (trigger new deploy of current code)
# Note: Render doesn't have a "rollback to deploy ID" API — use dashboard or git revert
```

---

## Rollback: Scheduler Service

Scheduler can be rolled back independently of the API:

1. Render Dashboard → `ai-pulse-scheduler` → **Deploys**
2. Find the last good deployment → **Redeploy**

The scheduler is stateless (reads from DB, writes to DB). Rolling it back has no
data side effects other than pausing job execution briefly during the redeploy.

---

## Rollback: Database Migrations

**Automatic rollback is NOT safe for most migrations.**

### If the migration was non-destructive (added columns/tables):

```bash
# Connect to the database
cd backend
export DATABASE_SYNC_URL="postgresql://..."

# List migration history
alembic history

# Downgrade one step
alembic downgrade -1

# Or downgrade to a specific revision
alembic downgrade <revision_id>
```

### If the migration was destructive (dropped columns/tables):

**Do not attempt automatic rollback.** Instead:
1. Restore from the last database backup
2. Re-deploy the previous application version
3. Investigate and fix the migration

### Render PostgreSQL Backups

Render's Starter PostgreSQL plan includes daily backups retained for 7 days.

Restore via Render Dashboard:
1. Dashboard → PostgreSQL database → **Backups**
2. Select the backup point
3. Click **Restore**

**Warning:** Restoring a backup drops all data written after the backup point.

---

## Rollback Decision Tree

```
Deployment failed
       │
       ├─ API health check failed?
       │       │
       │       ├─ Yes → Redeploy API to last good version
       │       │          Dashboard → Deploys → Redeploy
       │       │
       │       └─ No → Check scheduler logs
       │
       ├─ Scheduler not processing jobs?
       │       │
       │       └─ Redeploy scheduler independently
       │
       ├─ Database error after migration?
       │       │
       │       ├─ Non-destructive? → alembic downgrade -1
       │       └─ Destructive? → restore from backup
       │
       └─ Unclear? → Roll back API + scheduler, investigate logs
```

---

## Verifying Rollback Success

After rolling back:

```bash
API_URL=https://ai-pulse-api.onrender.com

# Health
curl -f $API_URL/health

# Database connectivity
curl -f $API_URL/health/database

# Verify API version / commit (check Render deploy list matches expected commit)
curl $API_URL/api/v1/briefings   # should not error 500
```

Check Render dashboard that the scheduler service is in `running` state (not `failed`).

---

## Recovery Contacts and Runbook

1. **First**: Check Render Status page for platform incidents
2. **Logs**: Render Dashboard → Service → **Logs** (last 24h)
3. **Database logs**: Render PostgreSQL → Logs
4. **Deployment history**: GitHub Actions → Deploy to Production → run history

Keep the last known-good commit SHA documented in your team's incident channel
immediately after each successful deploy.
