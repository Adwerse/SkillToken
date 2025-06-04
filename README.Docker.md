# Docker конфигурация для Web3 проекта

Этот проект содержит полную Docker конфигурацию для контейнеризации Hardhat backend и Next.js frontend приложений.

## Структура Docker файлов

### Production конфигурация
- `Dockerfile` - Основной Dockerfile для Hardhat backend (production)
- `frontend/Dockerfile` - Dockerfile для Next.js frontend (production)  
- `compose.yaml` - Docker Compose для production окружения

### Development конфигурация
- `Dockerfile.dev` - Dockerfile для Hardhat backend (development)
- `frontend/Dockerfile.dev` - Dockerfile для Next.js frontend (development)
- `compose.dev.yaml` - Docker Compose для development окружения

## Быстрый старт

### Production запуск
```bash
# Запуск всех сервисов
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build

# Остановка всех сервисов
docker-compose down
```

### Development запуск
```bash
# Запуск development окружения
docker-compose -f compose.dev.yaml up --build

# Запуск в фоновом режиме
docker-compose -f compose.dev.yaml up -d --build

# Остановка development окружения
docker-compose -f compose.dev.yaml down
```

## Доступные сервисы

### Hardhat Node
- **Production**: `http://localhost:8545`
- **Development**: `http://localhost:8545` (с hot reload)
- **Debug порт**: `9229` (только в development)

### Next.js Frontend
- **Production**: `http://localhost:3000`
- **Development**: `http://localhost:3000` (с hot reload)

## Функциональность

### Production сборка
- **Многоэтапная сборка** для оптимизации размера образов
- **Безопасность**: Использование non-root пользователей
- **Health checks** для контроля состояния сервисов
- **Optimized caching** слоев Docker для быстрых пересборок

### Development сборка
- **Hot reload** для обоих сервисов
- **Volume mounting** для мгновенного отражения изменений
- **Debug порт** для Hardhat backend
- **Polling mode** для файловой системы в Windows/WSL

## Полезные команды

### Управление контейнерами
```bash
# Просмотр запущенных контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs
docker-compose logs hardhat
docker-compose logs frontend

# Подключение к контейнеру
docker-compose exec hardhat sh
docker-compose exec frontend sh
```

### Управление данными
```bash
# Очистка всех данных
docker-compose down -v

# Пересборка без кеша
docker-compose build --no-cache

# Удаление неиспользуемых образов
docker system prune -a
```

### Отладка
```bash
# Просмотр состояния health checks
docker-compose ps

# Просмотр детальных логов
docker-compose logs -f --tail=100

# Запуск отдельного сервиса
docker-compose up hardhat
docker-compose up frontend
```

## Переменные окружения

### Backend (Hardhat)
- `NODE_ENV`: production/development
- `REPORT_GAS`: Включение отчетов о газе
- `ETHERSCAN_API_KEY`: API ключ для верификации

### Frontend (Next.js)
- `NODE_ENV`: production/development
- `NEXT_PUBLIC_HARDHAT_URL`: URL Hardhat ноды
- `NEXT_TELEMETRY_DISABLED`: Отключение телеметрии

## Сети Docker

Проект использует пользовательские сети Docker:
- `web3-network` - для production
- `web3-dev-network` - для development

Это обеспечивает изоляцию и правильное взаимодействие между сервисами.

## Volumes

### Production
- `hardhat-data`: Данные блокчейна
- `node-modules-cache`: Кеш зависимостей

### Development  
- `hardhat-dev-data`: Данные для разработки
- Volume mounting для hot reload

## Порты

| Сервис | Production | Development | Описание |
|--------|------------|-------------|----------|
| Hardhat | 8545 | 8545 | JSON-RPC API |
| Hardhat Debug | - | 9229 | Node.js отладчик |
| Frontend | 3000 | 3000 | Next.js приложение |

## Troubleshooting

### Общие проблемы

1. **Порт уже занят**
   ```bash
   # Найти процесс на порту
   netstat -tulpn | grep :8545
   # Остановить процесс
   kill -9 <PID>
   ```

2. **Проблемы с правами доступа**
   ```bash
   # Исправить права на файлы
   sudo chown -R $USER:$USER .
   ```

3. **Медленная сборка**
   ```bash
   # Использовать BuildKit
   DOCKER_BUILDKIT=1 docker-compose build
   ```

4. **Проблемы с hot reload**
   ```bash
   # Для Windows/WSL добавить в .env
   WATCHPACK_POLLING=true
   ```

### Логи и отладка
```bash
# Детальные логи сборки
docker-compose build --progress=plain

# Мониторинг ресурсов
docker stats

# Анализ размера образов
docker images
```

## Производительность

### Оптимизация сборки
- Используется многоэтапная сборка
- Кеширование зависимостей
- Минимальные Alpine образы
- Оптимизация .dockerignore файлов

### Мониторинг
- Health checks для всех сервисов
- Автоматический restart при сбоях
- Логирование всех операций

### Deploying your application to the cloud

First, build your image, e.g.: `docker build -t myapp .`.
If your cloud uses a different CPU architecture than your development
machine (e.g., you are on a Mac M1 and your cloud provider is amd64),
you'll want to build the image for that platform, e.g.:
`docker build --platform=linux/amd64 -t myapp .`.

Then, push it to your registry, e.g. `docker push myregistry.com/myapp`.

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)