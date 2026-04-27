# Evarx API

FastAPI backend for the Evarx platform.

## Stack

- Python 3.12 + FastAPI
- SQLAlchemy 2.0 (async) + Alembic
- PostgreSQL (asyncpg) + Redis
- Pydantic v2 / Pydantic Settings
- structlog + Sentry
- `uv` for dependency management

## Local development

```bash
# 1. Boot Postgres + Redis
docker compose -f ../../infra/compose/docker-compose.api.yml up -d

# 2. Set up Python env (one-time)
cp .env.example .env
uv venv
uv sync --extra dev

# 3. Run migrations
uv run alembic upgrade head

# 4. Start the API with hot-reload
uv run uvicorn evarx_api.main:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs for the interactive API explorer.

## Tests

```bash
uv run pytest
```

## Migrations

```bash
# After editing models in evarx_api/*/models.py:
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

## Deployment (Phase 0 — Railway)

1. Sign up at https://railway.app and link your GitHub.
2. **New Project → Deploy from GitHub repo** → pick `Abhinay2323/evarx-ai-platform`.
3. In Service Settings:
   - **Root Directory**: `apps/api`
   - **Watch Paths**: `apps/api/**` (so web changes don't trigger backend deploys)
   - **Builder**: Dockerfile
4. Add a Postgres plugin (Railway → New → Database → PostgreSQL). Copy the
   `DATABASE_URL` and replace `postgresql://` with `postgresql+asyncpg://`.
   Save it as an env var on the API service.
5. Add a Redis plugin or use Upstash free tier — set `REDIS_URL`.
6. Required env vars on the API service:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `ALLOWED_ORIGINS=https://evarx.in,https://www.evarx.in,https://app.evarx.in`
   - `ENV=prod`
7. **Generate Domain** in Settings → Networking. Note the URL — that's your
   API base URL. Add it to the frontend as `NEXT_PUBLIC_API_URL`.
8. Push to `main`. Railway auto-deploys. Verify with
   `curl https://<your-railway-url>/health`.

## Layout

```
apps/api/
├── src/evarx_api/
│   ├── main.py             FastAPI app factory
│   ├── settings.py         Pydantic Settings
│   ├── core/               db, redis, exceptions, shared infra
│   ├── health/             liveness + readiness probes
│   ├── orgs/               tenants, memberships
│   ├── users/              (phase 1) Supabase user mirroring
│   ├── auth/               (phase 1) JWT verification
│   ├── chat/               (phase 1) streaming chat completions
│   ├── data/               (phase 2) document upload
│   ├── rag/                (phase 2) retrieval pipeline
│   ├── agents/             (phase 3) agent CRUD + invoke
│   ├── workflows/          (phase 3) DAG runner
│   ├── models/             (phase 4) engine routing via LiteLLM
│   ├── jobs/               (phase 4) fine-tune job orchestration
│   ├── billing/            (phase 5) Stripe + usage metering
│   └── logs/               (phase 5) audit log writer
├── alembic/                migrations
├── tests/
├── pyproject.toml
└── Dockerfile
```

The empty subdirectories are placeholders for the phased roadmap; each will
gain `models.py`, `schemas.py`, `routes.py` (and sometimes `service.py` /
`tasks.py`) as we land each phase.
