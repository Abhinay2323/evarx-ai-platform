SHELL := /bin/bash

.PHONY: help install dev build start lint typecheck \
        docker-build docker-up docker-down docker-logs \
        api-deps api-up api-down api-dev api-test api-migrate api-revision

help:
	@echo "Evarx platform — common commands"
	@echo ""
	@echo "  Web (apps/web)"
	@echo "    make install        Install web dependencies"
	@echo "    make dev            Run the website in dev mode (port 3000)"
	@echo "    make build          Production build of the website"
	@echo "    make start          Start the built website"
	@echo "    make lint           Lint the website"
	@echo "    make typecheck      TypeScript check"
	@echo ""
	@echo "  API (apps/api)"
	@echo "    make api-deps       Install API Python dependencies (uv)"
	@echo "    make api-up         Start Postgres + Redis (docker compose)"
	@echo "    make api-down       Stop Postgres + Redis"
	@echo "    make api-migrate    Apply Alembic migrations"
	@echo "    make api-revision m='msg'  Create a new auto-generated migration"
	@echo "    make api-dev        Run FastAPI with hot-reload (port 8000)"
	@echo "    make api-test       Run API tests"
	@echo ""
	@echo "  Production (web + Caddy on a single VPS)"
	@echo "    make docker-build   Build the production Docker image"
	@echo "    make docker-up      Start production stack via Compose"
	@echo "    make docker-down    Stop production stack"
	@echo "    make docker-logs    Tail Compose logs"

# ---- Web ----

install:
	cd apps/web && npm install

dev:
	cd apps/web && npm run dev

build:
	cd apps/web && npm run build

start:
	cd apps/web && npm run start

lint:
	cd apps/web && npm run lint

typecheck:
	cd apps/web && npm run typecheck

# ---- API ----

api-deps:
	cd apps/api && uv sync --extra dev

api-up:
	docker compose -f infra/compose/docker-compose.api.yml up -d

api-down:
	docker compose -f infra/compose/docker-compose.api.yml down

api-migrate:
	cd apps/api && uv run alembic upgrade head

api-revision:
	cd apps/api && uv run alembic revision --autogenerate -m "$(m)"

api-dev:
	cd apps/api && uv run uvicorn evarx_api.main:app --reload --host 0.0.0.0 --port 8000

api-test:
	cd apps/api && uv run pytest -v

# ---- Production stack ----

docker-build:
	docker build -f apps/web/Dockerfile -t evarx/web:latest .

docker-up:
	cd infra/compose && docker compose up -d --build

docker-down:
	cd infra/compose && docker compose down

docker-logs:
	cd infra/compose && docker compose logs -f --tail=100
