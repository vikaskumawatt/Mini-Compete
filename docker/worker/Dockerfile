# Base stage
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN yarn global add turbo

# Dependencies stage
FROM base AS dependencies
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/src/prisma ./apps/backend/src/prisma/
COPY turbo.json ./
RUN apk add --no-cache python3 make g++
RUN yarn install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/backend/node_modules ./apps/backend/node_modules
COPY . .
RUN yarn workspace @mini-compete/backend prisma generate
RUN turbo run build --filter=@mini-compete/backend

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 worker

# Copy built dist
COPY --from=builder --chown=worker:nodejs /app/apps/backend/dist ./dist

# Flatten and merge node_modules into dist for relative resolution
RUN mkdir -p ./dist/node_modules
COPY --from=builder --chown=worker:nodejs /app/apps/backend/node_modules ./dist/node_modules
COPY --from=builder --chown=worker:nodejs /app/node_modules ./dist/node_modules
RUN ln -s ./dist/node_modules ./dist/root_node_modules || true  # Ignore if exists

# Copy Prisma and package.json to dist
COPY --from=builder --chown=worker:nodejs /app/apps/backend/src/prisma ./dist/prisma
COPY --from=builder --chown=worker:nodejs /app/apps/backend/package.json ./dist/

WORKDIR /app/dist

USER worker

CMD ["node", "worker.js"]