export UV_CACHE_DIR ?= $(CURDIR)/.cache/uv
export RUFF_CACHE_DIR ?= $(CURDIR)/.cache/ruff
export PYTEST_ADDOPTS ?= -o cache_dir=$(CURDIR)/.cache/pytest

include .env
export

.PHONY: run lint typecheck test migrate up up-build up-db down logs ps

run:
	uv run uvicorn app.main:app --host 0.0.0.0 --port $${APP_PORT:-8000} --reload

lint:
	-uv run ruff format .
	-uv run ruff check --fix .

typecheck:
	uv run pyright

test:
	uv run pytest -q

migrate:
	uv run alembic upgrade head

up:
	docker compose up -d db app

up-build:
	docker compose up -d --build db app

up-db:
	docker compose up -d db

down:
	docker compose down

logs:
	docker compose logs -f db app

ps:
	docker compose ps db app
