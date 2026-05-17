#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="docker-compose.prod.yml"

if [[ ! -f .env ]]; then
  echo "Файл .env не найден. Создайте его: cp .env.prod.example .env"
  exit 1
fi

if [[ -n "${DOCKER_IMAGE:-}" ]]; then
  docker compose -f "$COMPOSE_FILE" pull app
else
  docker compose -f "$COMPOSE_FILE" build
fi

docker compose -f "$COMPOSE_FILE" up -d
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "API (локально на сервере): http://127.0.0.1:8001/docs"
