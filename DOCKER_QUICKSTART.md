# Быстрый запуск Docker

## Production запуск (рекомендуется)
```bash
# Запуск всех сервисов
docker-compose up --build -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

**Доступ к сервисам:**
- Hardhat Node: http://localhost:8545
- Frontend: http://localhost:3000

## Development запуск
```bash
# Запуск с hot reload
docker-compose -f compose.dev.yaml up --build

# В фоновом режиме
docker-compose -f compose.dev.yaml up --build -d
```

## Остановка
```bash
# Production
docker-compose down

# Development  
docker-compose -f compose.dev.yaml down

# С удалением volumes
docker-compose down -v
```

## Полезные команды
```bash
# Пересборка без кеша
docker-compose build --no-cache

# Подключение к контейнеру
docker-compose exec hardhat sh
docker-compose exec frontend sh

# Просмотр логов отдельного сервиса
docker-compose logs hardhat
docker-compose logs frontend
``` 