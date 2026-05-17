#!/usr/bin/env bash
set -euo pipefail

IMAGE="${1:?Usage: remote-deploy.sh <docker-image>}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="docker-compose.prod.yml"

if [[ ! -f .env ]]; then
  echo "Файл .env не найден на сервере. Создайте: cp .env.prod.example .env"
  exit 1
fi

if [[ -d .git ]]; then
  git fetch origin ai
  git checkout ai
  git pull --ff-only origin ai
fi

export DOCKER_IMAGE="$IMAGE"

if [[ -n "${GHCR_TOKEN:-}" ]]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-}" --password-stdin
fi

docker compose -f "$COMPOSE_FILE" pull app
docker compose -f "$COMPOSE_FILE" up -d
docker compose -f "$COMPOSE_FILE" ps

docker image prune -f

echo ""
echo "Deployed: $DOCKER_IMAGE"
