SHELL := /bin/bash

.PHONY: help install dev build start lint typecheck docker-build docker-up docker-down docker-logs

help:
	@echo "Evarx platform — common commands"
	@echo ""
	@echo "  make install        Install web dependencies"
	@echo "  make dev            Run the website in dev mode (port 3000)"
	@echo "  make build          Production build of the website"
	@echo "  make start          Start the built website"
	@echo "  make lint           Lint the website"
	@echo "  make typecheck      TypeScript check"
	@echo "  make docker-build   Build the production Docker image"
	@echo "  make docker-up      Start production stack (web + Caddy) via Compose"
	@echo "  make docker-down    Stop production stack"
	@echo "  make docker-logs    Tail Compose logs"

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

docker-build:
	docker build -f apps/web/Dockerfile -t evarx/web:latest .

docker-up:
	cd infra/compose && docker compose up -d --build

docker-down:
	cd infra/compose && docker compose down

docker-logs:
	cd infra/compose && docker compose logs -f --tail=100
