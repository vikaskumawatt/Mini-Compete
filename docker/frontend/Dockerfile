# Base stage
FROM node:22-bullseye AS base
WORKDIR /app
RUN yarn global add turbo

# Dependencies stage
FROM base AS dependencies
COPY package.json yarn.lock ./ 
COPY apps/frontend/package.json ./apps/frontend/
COPY turbo.json ./
RUN yarn install --frozen-lockfile

RUN yarn config set network-timeout 600000 \
  && yarn config set registry "https://registry.npmjs.org/" \
  && yarn install --frozen-lockfile --network-concurrency 1

# Builder stage
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN turbo run build --filter=@mini-compete/frontend

# Production stage
FROM node:22-bullseye AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["yarn", "start"]
