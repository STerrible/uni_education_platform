# Uni Edu Platform (Backend)

Backend учебной платформы на FastAPI.

## Что реализовано

- Аутентификация: регистрация, логин, смена пароля, refresh token
- Админ CRUD: курсы, уроки, тесты
- Студенческий API: каталог, запись на курс, прохождение тестов, прогресс, история
- Миграции через Alembic

## Технологии

- Python 3.12
- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- uv (зависимости и запуск)
- Ruff + Pyright
- Pytest + testcontainers-python

## Быстрый старт (локально)

1. Подготовить окружение:

```bash
cp .env.example .env
uv sync --python 3.12
```

1. Запустить БД и приложение в Docker:

```bash
docker compose up -d db app
```

1. Применить миграции:

```bash
uv run alembic upgrade head
```

API будет доступен на `http://localhost:8000`, документация: `http://localhost:8000/docs`.

## Запуск без Docker (только приложение)

Если PostgreSQL уже доступен отдельно:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Основные команды

```bash
make up           # or: docker compose up -d db app
make up-build     # or: docker compose up -d --build db app
make up-db        # or: docker compose up -d db
make down         # or: docker compose down
make ps           # or: docker compose ps db app
make logs         # or: docker compose logs -f db app

make migrate      # or: uv run alembic upgrade head
make test         # or: uv run pytest -q
make lint         # or: uv run ruff format . && uv run ruff check --fix .
make typecheck    # or: uv run pyright
make run          # or: uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Тесты

Тесты используют `testcontainers-python` и поднимают временный контейнер PostgreSQL автоматически.

Требования:
- запущенный Docker daemon

Запуск:

```bash
uv run pytest -q
```

## Переменные окружения

Обязательные переменные описаны в `.env.example`.

`DATABASE_URL` явно задавать не нужно: приложение собирает его из `POSTGRES_*`.

## Структура проекта

```text
app/
  api/           # роуты
  core/          # конфиг, БД, зависимости, security
  models/        # SQLAlchemy модели
  schemas/       # Pydantic схемы
  services/      # прикладные сервисы
alembic/         # миграции
tests/           # тесты
```

## Дополнительные документы

- `DEPLOY.md` — деплой и эксплуатация
