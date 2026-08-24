# AI Pulse

> Know what happened. Understand why it matters. Learn what comes next.

AI Pulse is a personalized AI intelligence and learning platform that automatically collects important AI developments, analyzes them using AI, ranks their importance, summarizes them, explains why they matter, and tells you what to learn next.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, TanStack Query |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Cache / Queue | Redis |
| AI | Anthropic Claude (configurable) |
| Email | SMTP (configurable) |
| Scheduling | APScheduler |
| Infrastructure | Docker Compose |

## Quick Start

### 1. Clone and configure

```bash
git clone <repo>
cd ai-pulse

# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env and add your ANTHROPIC_API_KEY and other settings

# Frontend configuration
cp frontend/.env.example frontend/.env.local
```

### 2. Run with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- FastAPI backend on port 8000
- Next.js frontend on port 3000

### 3. Open the app

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/api/docs (debug mode only)

### 4. Trigger your first ingestion (optional)

After registering an admin account, trigger ingestion manually:

```bash
curl -X POST http://localhost:8000/api/v1/admin/ingestion/trigger \
  -H "Authorization: Bearer <your-token>"
```

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env  # configure .env

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Key Features

- **Daily briefing**: 5–10 top AI developments with summaries, why-it-matters analysis, and learning recommendations
- **Personalization**: Tailored by experience level, interests, and reading time
- **Content ingestion**: RSS feeds from 10+ major AI publications (configurable)
- **AI analysis**: Each article is analyzed for importance, category, companies, concepts, and learning topics
- **Daily learning recommendation**: One focused learning topic tied to today's top developments
- **Explore**: Browse all articles by category, search, or importance
- **Email delivery**: Daily briefing sent to your inbox
- **Admin dashboard**: Manage sources, trigger ingestion, view stats

## Environment Variables

See `backend/.env.example` for all options. Required:
- `SECRET_KEY` — JWT secret (min 32 chars, change in production)
- `DATABASE_URL` — PostgreSQL connection string
- `ANTHROPIC_API_KEY` — For AI analysis and briefing generation

## Architecture

```
Users → Next.js Frontend → FastAPI Backend → PostgreSQL
                                          → Redis
                                          → APScheduler (ingestion + briefing jobs)
                                          → Anthropic API (AI analysis)
                                          → SMTP (email delivery)
```

## Development Phases

- **Phase 1** ✅ Architecture & planning
- **Phase 2** ✅ MVP (auth, ingestion, AI analysis, daily briefing, dashboard)
- **Phase 3** — Personalization engine, advanced learning, search
- **Phase 4** — Knowledge graph, quizzes, learning paths
- **Phase 5** — Mobile, additional notification channels, monetization
