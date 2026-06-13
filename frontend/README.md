# Frontend Uni Education Platform

React-приложение для итогового проекта: каталог курсов, авторизация, личный кабинет, интеграция с backend API и Service Worker.

## Команды

```bash
npm install
npm run dev
npm run build
npm run test
```

## Docker

```bash
docker compose up -d --build frontend
```

Nginx отдаёт статические файлы и проксирует `/api/*` в backend-сервис `app`.
