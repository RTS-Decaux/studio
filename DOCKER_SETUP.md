# Docker Setup for AI Chatbot

Этот проект настроен для работы с Docker и Docker Compose, используя pnpm как пакетный менеджер.

## Структура файлов

- `Dockerfile` - Multi-stage build для оптимизации размера образа
- `docker-compose.yml` - Оркестрация сервисов (app, postgres, redis)
- `.dockerignore` - Исключение ненужных файлов из контекста сборки
- `.env.docker.example` - Пример переменных окружения

## Быстрый старт

### 1. Настройка переменных окружения

Скопируйте файл с примером и заполните своими значениями:

```bash
cp .env.docker.example .env
```

Отредактируйте `.env` и укажите:

- Supabase credentials (URL, anon key, service role key)
- API ключи (OpenAI или Gemini)
- fal.ai API key для Studio
- Другие настройки

### 2. Сборка и запуск

```bash
# Сборка образов
docker-compose build

# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f app
```

Приложение будет доступно по адресу: http://localhost:3000

### 3. Остановка

```bash
# Остановка всех сервисов
docker-compose down

# Остановка и удаление volumes (БД и Redis данные)
docker-compose down -v
```

## Структура сервисов

### app

- **Порт**: 3000
- **Описание**: Next.js приложение с AI Chatbot
- **Зависимости**: supabase-db (optional), redis (optional)

### supabase-db (опционально)

- **Порт**: 5432
- **Описание**: PostgreSQL база данных (для локальной разработки)
- **Volume**: `supabase-db-data`

### redis (опционально)

- **Порт**: 6379
- **Описание**: Redis для resumable streams
- **Volume**: `redis-data`

## Режимы работы

### Production Mode (по умолчанию)

Полностью собранный образ с оптимизацией:

```bash
docker-compose up -d
```

### Development Mode

Для разработки с hot reload раскомментируйте volumes в `docker-compose.yml`:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

И измените команду в Dockerfile на:

```dockerfile
CMD ["pnpm", "dev"]
```

Затем пересоберите:

```bash
docker-compose up --build
```

## Использование с внешним Supabase

Если вы используете hosted Supabase (не локальный), просто:

1. Удалите или закомментируйте сервис `supabase-db` в `docker-compose.yml`
2. Укажите production URL в `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

## Troubleshooting

### Ошибка "Cannot find module"

Пересоберите образ:

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Приложение не запускается

Проверьте логи:

```bash
docker-compose logs app
```

Проверьте health check:

```bash
docker-compose ps
```

### Проблемы с базой данных

Пересоздайте volumes:

```bash
docker-compose down -v
docker-compose up -d
```

## Полезные команды

```bash
# Зайти в контейнер приложения
docker-compose exec app sh

# Запустить миграции Supabase
docker-compose exec app pnpm supabase db push

# Посмотреть использование ресурсов
docker stats

# Удалить все неиспользуемые образы и volumes
docker system prune -a --volumes
```

## Production Deployment

Для production рекомендуется:

1. Использовать managed Supabase вместо локального PostgreSQL
2. Использовать managed Redis (Upstash, Redis Cloud)
3. Настроить reverse proxy (nginx, Caddy)
4. Использовать secrets management (Docker Secrets, Kubernetes Secrets)
5. Настроить мониторинг и логирование

### Пример с nginx

```yaml
services:
  app:
    # ... existing config
    expose:
      - "3000"
    # Удалите ports, nginx будет проксировать

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

## Оптимизация

Текущий Dockerfile использует:

- Multi-stage build для минимального размера образа
- pnpm с frozen lockfile для воспроизводимости
- Next.js standalone output для оптимальной производительности
- Non-root user для безопасности
- Health checks для мониторинга

Финальный образ весит ~150-200MB (зависит от зависимостей).

## Документация

- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [pnpm Docker Guide](https://pnpm.io/docker)
