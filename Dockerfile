# Python 3.12 — стабильные wheels для pydantic/SQLAlchemy
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем uv
RUN pip install --no-cache-dir uv

# Копируем файлы зависимостей и устанавливаем runtime-зависимости
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --frozen --no-dev

# Копируем весь код приложения
COPY . .

# Открываем порт 8000 (внутри контейнера)
EXPOSE 8000

ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
