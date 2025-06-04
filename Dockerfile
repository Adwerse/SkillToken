# Многоэтапная сборка для оптимизации размера образа
FROM node:22.14.0-alpine AS dependencies

# Добавляем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S hardhat -u 1001

# Рабочая директория
WORKDIR /usr/src/app

# Копируем файлы для установки зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем все зависимости (включая dev)
RUN npm ci

# Этап сборки
FROM node:22.14.0-alpine AS builder

WORKDIR /usr/src/app

# Копируем зависимости из предыдущего этапа
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./

# Копируем исходный код
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/
COPY ignition/ ./ignition/
COPY test/ ./test/
COPY hardhat.config.ts ./
COPY .solcover.js ./

# Компилируем контракты
RUN npm run compile

# Финальный этап
FROM node:22.14.0-alpine AS runtime

# Устанавливаем curl для health check
RUN apk add --no-cache curl

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S hardhat -u 1001

WORKDIR /usr/src/app

# Копируем все зависимости (включая dev) для работы Hardhat
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/contracts ./contracts
COPY --from=builder /usr/src/app/scripts ./scripts
COPY --from=builder /usr/src/app/ignition ./ignition
COPY --from=builder /usr/src/app/artifacts ./artifacts
COPY --from=builder /usr/src/app/typechain-types ./typechain-types
COPY --from=builder /usr/src/app/cache ./cache
COPY package*.json ./
COPY hardhat.config.ts ./
COPY tsconfig.json ./

# Меняем владельца файлов
RUN chown -R hardhat:nodejs /usr/src/app
USER hardhat

# Указываем порт
EXPOSE 8545

# Добавляем health check с более длительным временем старта
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8545 || exit 1

# Запуск Hardhat ноды
CMD ["./node_modules/.bin/hardhat", "node"]
