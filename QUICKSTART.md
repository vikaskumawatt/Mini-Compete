# Quick Start Guide

Get Mini Compete running in 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ and Yarn (for local development)

## 🚀 Option 1: Docker (Fastest)

Perfect for trying out the application quickly.

### 1. Clone & Configure

```bash
git clone <repository-url>
cd mini-compete

# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

### 2. Update JWT Secret

Open `apps/backend/.env` and change:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

### 3. Start Everything

```bash
# Using Make (recommended)
make docker-up

# Or using Docker Compose directly
docker-compose up -d
docker-compose exec backend yarn prisma migrate deploy
docker-compose exec backend yarn prisma db seed
```

### 4. Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:3001
- 📚 **API Docs**: http://localhost:3001/api/docs

### 5. Login with Test Credentials

**Participant:**

- Email: `participant1@minicompete.com`
- Password: `password123`

**Organizer:**

- Email: `organizer1@minicompete.com`
- Password: `password123`

---

## 💻 Option 2: Local Development

Better for development and debugging.

### 1. Install Dependencies

```bash
git clone <repository-url>
cd mini-compete
yarn install
```

### 2. Start Infrastructure

```bash
# Start only Postgres and Redis
make dev-services

# Or manually:
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Setup Database

```bash
# Copy environment files
cp apps/backend/.env.example apps/backend/.env

# Update DATABASE_URL and JWT_SECRET in apps/backend/.env

# Run migrations and seed
make migrate
make seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend API
yarn workspace @mini-compete/backend dev

# Terminal 2: Worker (background jobs)
yarn workspace @mini-compete/backend worker

# Terminal 3: Frontend
yarn workspace @mini-compete/frontend dev
```

### 5. Access

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

---

## 📖 What's Next?

### Try These Workflows

#### 1. Register as Participant

```bash
# Via UI
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create a participant account
4. Browse and register for competitions

# Via API
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "PARTICIPANT"
  }'
```

#### 2. Create Competition as Organizer

```bash
# Login as organizer
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer1@minicompete.com",
    "password": "password123"
  }'

# Save the token from response, then:
curl -X POST http://localhost:3001/api/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Competition",
    "description": "Test competition",
    "tags": ["test"],
    "capacity": 50,
    "regDeadline": "2025-12-31T23:59:59Z"
  }'
```

#### 3. Test Idempotency

```bash
# Register with same idempotency key twice
IDEMPOTENCY_KEY=$(uuidgen)

# First request (creates registration)
curl -X POST http://localhost:3001/api/competitions/COMPETITION_ID/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"

# Second request (returns cached response)
curl -X POST http://localhost:3001/api/competitions/COMPETITION_ID/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"
```

### Explore the System

#### View Simulated Emails (MailBox)

```bash
# Connect to database
make psql

# Then run:
SELECT * FROM mailbox ORDER BY sent_at DESC LIMIT 10;
```

#### Check Background Jobs

```bash
# Redis CLI
make redis-cli

# View queues
KEYS bull:*

# Check job counts
HGETALL bull:registration:counts
```

#### Monitor Logs

```bash
# All services
make logs

# Specific service
make logs-backend
make logs-worker
```

### Database Management

```bash
# Open Prisma Studio (GUI)
make studio

# Connect to PostgreSQL
make psql

# View Redis data
make redis-cli

# Reset database (⚠️ destroys data)
make reset
```

---

## 🧪 Testing

### Load Test Registration Concurrency

```bash
# Install Apache Bench
# Mac: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Test concurrent registrations
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: test-$(date +%s)" \
  -p /dev/null \
  http://localhost:3001/api/competitions/COMPETITION_ID/register
```

### Run Test Suite

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Coverage
yarn test:cov
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000/3001/5432/6379
lsof -i :3000

# Kill the process
kill -9 PID
```

### Database Connection Failed

```bash
# Check if Postgres is running
docker ps | grep postgres

# View Postgres logs
docker logs mini-compete-postgres

# Restart Postgres
docker-compose restart postgres
```

### Redis Connection Failed

```bash
# Check Redis
docker exec -it mini-compete-redis redis-cli ping

# Should return: PONG

# Restart Redis
docker-compose restart redis
```

### Prisma Client Outdated

```bash
# Regenerate Prisma Client
yarn workspace @mini-compete/backend prisma generate
```

### Worker Not Processing Jobs

```bash
# Check worker logs
docker logs mini-compete-worker -f

# Or if running locally
# Check terminal where worker is running

# Verify Redis connection
docker exec -it mini-compete-redis redis-cli
> PING
> KEYS bull:*
```

### Frontend Build Failed

```bash
# Clear Next.js cache
rm -rf apps/frontend/.next

# Rebuild
yarn workspace @mini-compete/frontend build
```

---

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Import [Postman collection](postman/mini-compete.postman_collection.json)

## 🆘 Getting Help

- Check existing [GitHub Issues](../../issues)
- Read the [FAQ section](README.md#troubleshooting)
- Review API docs at http://localhost:3001/api/docs

---

**Happy coding! 🎉**
