# Base stage
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN yarn global add turbo

# Dependencies stage
FROM base AS dependencies
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/
COPY turbo.json ./
RUN yarn install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
RUN yarn workspace @mini-compete/backend prisma generate
RUN turbo run build --filter=@mini-compete/backend

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 worker

COPY --from=builder --chown=worker:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=worker:nodejs /app/apps/backend/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/node_modules ./root_node_modules
COPY --from=builder --chown=worker:nodejs /app/apps/backend/prisma ./prisma
COPY --from=builder --chown=worker:nodejs /app/apps/backend/package.json ./

USER worker

CMD ["node", "dist/worker.js"]