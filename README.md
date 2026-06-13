# Uni Edu Platform

Учебная платформа с backend на FastAPI и frontend на React.

## Что реализовано

- Аутентификация: регистрация, логин, смена пароля, refresh token
- Админ CRUD: курсы, уроки, тесты
- Связь урока с тестом: `lesson.test_id` (опционально)
- Студенческий API: каталог, запись на курс, последовательное прохождение уроков, тесты, прогресс, история
- Миграции через Alembic
- React-фронтенд: маршрутизация, авторизация, каталог курсов, личный кабинет
- Docker/Nginx-раздача статического frontend-приложения

## Логика прохождения курса

- Студент должен записаться на курс перед доступом к деталям курса и урокам.
- Уроки открываются последовательно.
- Следующий урок открывается после успешного прохождения теста предыдущего урока (если у предыдущего урока привязан тест).
- При правильном ответе на тест прогресс по курсу увеличивается на `+5%` (до `100%`).

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

2. Запустить БД и приложение в Docker:

```bash
docker compose up -d
```

3. Применить миграции:

```bash
uv run alembic upgrade head
```

4. Заполнить базу данных тестовыми данными (опционально):

```bash
uv run python seed.py
```

API будет доступен на `http://localhost:8000`, документация: `http://localhost:8000/docs`.
Frontend будет доступен на `http://localhost:8080`.

## Тестовые профили для входа

После заполнения базы данных тестовыми данными (команда `make seed` или `uv run python seed.py`) вы можете использовать следующие учетные записи для входа в приложение:

- **Профиль студента (для прохождения курсов, уроков и тестов):**
  - **Логин:** `student`
  - **Пароль:** `studentpass`
- **Профиль администратора:**
  - **Логин:** `admin`
  - **Пароль:** `adminpass`

## Запуск без Docker (только приложение)

Если PostgreSQL уже доступен отдельно:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Основные команды

```bash
make up           # or: docker compose up -d
docker compose up -d --build frontend  # frontend на http://localhost:8080
make up-build     # or: docker compose up -d --build
make up-db        # or: docker compose up -d db
make down         # or: docker compose down
make ps           # or: docker compose ps
make logs         # or: docker compose logs

make migrate      # or: uv run alembic upgrade head
make seed         # заполнить БД тестовыми данными
make openapi      # сгенерировать openapi.yaml
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
tests/           # backend-тесты
frontend/        # React-приложение, RTL/Vitest-тесты, Dockerfile и Nginx
```

## Дополнительные документы

- `DEPLOY.md` — деплой и эксплуатация
