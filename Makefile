.PHONY: help install dev build start stop clean migrate seed reset logs test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	yarn install

dev-services: ## Start only Postgres and Redis for local development
	docker-compose -f docker-compose.dev.yml up -d

dev: dev-services ## Start development servers (backend + worker + frontend)
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:3001"
	@echo "Frontend: http://localhost:3000"
	@echo "API Docs: http://localhost:3001/api/docs"
	yarn dev

build: ## Build all packages
	yarn build

start: ## Start production services with Docker Compose
	docker-compose up -d

stop: ## Stop all Docker services
	docker-compose down
	docker-compose -f docker-compose.dev.yml down

clean: ## Clean all node_modules and build artifacts
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf apps/*/dist
	rm -rf apps/*/.next
	rm -rf .turbo

migrate: ## Run database migrations
	yarn workspace @mini-compete/backend prisma migrate dev

seed: ## Seed database with test data
	yarn workspace @mini-compete/backend prisma db seed

reset: ## Reset database (⚠️  destroys all data)
	yarn workspace @mini-compete/backend prisma migrate reset --force

studio: ## Open Prisma Studio
	yarn workspace @mini-compete/backend prisma studio

logs: ## View Docker logs
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-worker: ## View worker logs
	docker-compose logs -f worker

test: ## Run tests
	yarn test

lint: ## Lint code
	yarn lint

format: ## Format code
	yarn format

psql: ## Connect to PostgreSQL
	docker-compose exec postgres psql -U postgres -d mini_compete

redis-cli: ## Connect to Redis CLI
	docker-compose exec redis redis-cli

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all services with Docker
	docker-compose up -d
	@echo "Waiting for services to be ready..."
	@sleep 5
	docker-compose exec backend yarn prisma migrate deploy
	docker-compose exec backend yarn prisma db seed
	@echo "✅ All services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"
	@echo "API Docs: http://localhost:3001/api/docs"

docker-down: ## Stop and remove Docker containers
	docker-compose down -v

docker-restart: ## Restart Docker services
	docker-compose restart

health: ## Check service health
	@echo "Checking Backend..."
	@curl -s http://localhost:3001/api/health | jq .
	@echo "\nChecking Frontend..."
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000