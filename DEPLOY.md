# Деплой на VPS (Docker + PostgreSQL + Nginx)

## Быстрый старт на сервере

```bash
# 1. Установка Docker (Ubuntu)
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"   # перелогиньтесь, если не root

# 2. Клонирование проекта
git clone <URL_РЕПОЗИТОРИЯ> uni_edu_platform
cd uni_edu_platform

# 3. Переменные окружения
cp .env.prod.example .env
nano .env   # задайте POSTGRES_PASSWORD, SECRET_KEY, DATABASE_URL (пароль в URL = POSTGRES_PASSWORD)

# Сгенерировать SECRET_KEY:
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# 4. Запуск
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

Проверка на сервере: `curl -s http://127.0.0.1:8001/docs | head`

## Локальная проверка prod-конфига

```bash
cp .env.prod.example .env
# отредактируйте .env
docker compose -f docker-compose.prod.yml up -d --build
```

## Nginx + HTTPS

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Замените api.example.com в конфиге на ваш домен
sudo cp deploy/nginx/educational-platform.conf /etc/nginx/sites-available/educational-platform
sudo nano /etc/nginx/sites-available/educational-platform
sudo ln -sf /etc/nginx/sites-available/educational-platform /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d api.example.com
```

DNS: A-запись `api.example.com` → IP VPS.

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Порт `8001` снаружи не открывайте — доступ только через Nginx (`127.0.0.1:8001`).

## Обновление версии

**Автоматически:** push в ветку `ai` → GitHub Actions собирает образ и деплоит на VPS.

**Вручную:**

```bash
cd ~/uni_edu_platform
git pull
./scripts/deploy.sh
```

Миграции применяются автоматически при старте контейнера (`scripts/entrypoint.sh`).

## GitHub Actions (CI/CD)

Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

| Событие | Действие |
|---------|----------|
| Pull Request в `ai` | Тесты (`pytest`) |
| Push в `ai` | Тесты → сборка образа → деплой на VPS |
| `workflow_dispatch` | То же, что push в `ai` |

Образ публикуется в **GitHub Container Registry**: `ghcr.io/<owner>/<repo>:<sha>`.

### Секреты репозитория (Settings → Secrets and variables → Actions)

| Секрет | Описание |
|--------|----------|
| `VPS_HOST` | IP или домен VPS |
| `VPS_USER` | SSH-пользователь (например `deploy`) |
| `VPS_SSH_KEY` | Приватный SSH-ключ (полностью, с `-----BEGIN...`) |
| `VPS_DEPLOY_PATH` | Путь к проекту на сервере, например `/home/deploy/uni_edu_platform` |
| `GHCR_READ_TOKEN` | GitHub PAT с правом `read:packages` для `docker pull` на VPS |

### Environment `production` (рекомендуется)

Settings → Environments → **production** → добавьте те же секреты (или только `VPS_*` / `GHCR_READ_TOKEN`).  
Так деплой можно ограничить approval перед выкладкой.

### Первичная настройка VPS для CI

```bash
# Пользователь deploy в группе docker
sudo usermod -aG docker deploy

# Клонировать репозиторий (нужен для docker-compose и .env)
git clone <URL> /home/deploy/uni_edu_platform
cd /home/deploy/uni_edu_platform
cp .env.prod.example .env && nano .env

# Первый запуск БД и приложения (сборка локально)
./scripts/deploy.sh

# Добавить публичный SSH-ключ GitHub Actions в ~/.ssh/authorized_keys
```

### PAT для GHCR (`GHCR_READ_TOKEN`)

GitHub → Settings → Developer settings → Personal access tokens:

- Classic: scope `read:packages`
- Или fine-grained: Packages → Read

На VPS образ приватный — без токена `docker pull` не сработает.

**Альтернатива:** сделать пакет публичным (Package settings → Change visibility) — тогда `GHCR_READ_TOKEN` не нужен.

### Проверка workflow

После push в `ai`: вкладка **Actions** в репозитории. Успешный деплой: `curl -s http://127.0.0.1:8001/docs` на сервере.

## Бэкап PostgreSQL

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U postgres educational_platform > backup_$(date +%F).sql
```

## Файлы

| Файл | Назначение |
|------|------------|
| `docker-compose.prod.yml` | Прод: app + PostgreSQL |
| `docker-compose.yml` | Локальная разработка (SQLite) |
| `.env.prod.example` | Шаблон `.env` для VPS |
| `deploy/nginx/educational-platform.conf` | Reverse proxy |
| `scripts/deploy.sh` | Сборка и запуск на сервере |
| `scripts/remote-deploy.sh` | Деплой из GitHub Actions |
| `.github/workflows/deploy.yml` | CI/CD workflow |
