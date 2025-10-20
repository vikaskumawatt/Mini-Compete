# Mini Compete - Competition Management System

A production-ready monorepo application for managing competitions and participant registrations, built with Next.js, NestJS, Prisma, and Redis.

## 🏗️ Architecture Overview

### Tech Stack
- **Monorepo**: Turborepo for optimized builds and caching
- **Backend**: NestJS (TypeScript) + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 14 (App Router) + React + Tailwind CSS
- **Queue**: BullMQ + Redis for background job processing
- **Auth**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with Prisma migrations
- **Containerization**: Docker + Docker Compose

### Project Structure
```
mini-compete/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── competitions/  # Competition management
│   │   │   ├── registrations/ # Registration logic
│   │   │   ├── queue/    # Job processors
│   │   │   ├── cron/     # Scheduled tasks
│   │   │   └── prisma/   # Database client
│   │   └── prisma/       # Schema & migrations
│   └── frontend/         # Next.js application
│       └── src/
│           ├── app/      # App router pages
│           ├── lib/      # API client & utilities
│           └── types/    # TypeScript types
├── docker/               # Dockerfiles
└── docker-compose.yml    # Service orchestration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn 1.22+
- Docker & Docker Compose (for containerized setup)
- PostgreSQL (if running locally)
- Redis (if running locally)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url>
cd mini-compete
```

2. **Create environment files**
```bash
# Root .env
cp .env.example .env

# Backend .env
cp apps/backend/.env.example apps/backend/.env

# Frontend .env (optional)
cp apps/frontend/.env.example apps/frontend/.env
```

3. **Update environment variables** in `.env` files (especially `JWT_SECRET`)

4. **Start all services**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
docker-compose exec backend yarn prisma migrate deploy
docker-compose exec backend yarn prisma db seed
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

### Option 2: Local Development

1. **Install dependencies**
```bash
yarn install
```

2. **Start PostgreSQL and Redis**
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mini_compete postgres:15
docker run -d -p 6379:6379 redis:7-alpine
```

3. **Set up environment variables**
```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

4. **Run database migrations and seed**
```bash
cd apps/backend
yarn prisma migrate dev
yarn prisma db seed
cd ../..
```

5. **Start development servers**
```bash
# Terminal 1: Backend API
yarn workspace @mini-compete/backend dev

# Terminal 2: Worker
yarn workspace @mini-compete/backend worker

# Terminal 3: Frontend
yarn workspace @mini-compete/frontend dev
```

## 📝 Test Credentials

After seeding the database, use these credentials:

### Organizers
- Email: `organizer1@minicompete.com` / Password: `password123`
- Email: `organizer2@minicompete.com` / Password: `password123`

### Participants
- Email: `participant1@minicompete.com` / Password: `password123`
- Email: `participant2@minicompete.com` / Password: `password123`
- Email: `participant3@minicompete.com` / Password: `password123`

## 🔑 Key Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Participant/Organizer)
- Protected routes and API endpoints

### 2. Competition Management
- Organizers can create competitions with:
  - Title, description, tags
  - Capacity and registration deadline
  - Optional start date
- View all competitions with search and filtering
- Real-time seat availability tracking

### 3. Registration System
- **Idempotency**: Prevents duplicate registrations using `Idempotency-Key` header
- **Concurrency Control**: 
  - Database transactions with SERIALIZABLE isolation
  - Row-level locking (FOR UPDATE)
  - Optimistic locking with version field
  - Distributed Redis locks
- **Capacity Management**: Prevents overselling seats
- **Deadline Validation**: Enforces registration deadlines

### 4. Background Job Processing
- **Registration Confirmation**: Async email simulation via MailBox table
- **Retry Logic**: Exponential backoff (3 attempts)
- **Dead Letter Queue**: Failed jobs stored in database
- **Job Persistence**: Redis stores jobs across restarts

### 5. Scheduled Tasks (Cron)
- **Reminder Job**: Sends notifications 24h before competition start
- **Cleanup Job**: Purges expired idempotency logs and old failed jobs
- Configurable schedules via environment variables

## 🏛️ Architecture Details

### Idempotency Implementation

**Problem**: Prevent duplicate registrations from network retries or multiple clicks

**Solution**: Three-layer idempotency system
1. **Redis Cache** (fast lookup, 24h TTL)
2. **Database Log** (persistent storage)
3. **Unique Constraint** (userId + competitionId)

```typescript
// Client sends header
headers: {
  'Idempotency-Key': 'unique-uuid-or-hash'
}

// Server checks cache → DB → processes → stores result
```

### Concurrency Control

**Problem**: Multiple users registering simultaneously for limited seats

**Solution**: Multi-layer protection
1. **Distributed Lock** (Redis): Serializes competition access
2. **Database Transaction** (SERIALIZABLE): Prevents race conditions
3. **Row-Level Lock** (FOR UPDATE): Locks competition record
4. **Optimistic Locking** (version field): Detects conflicts

```sql
-- Transaction flow
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM competitions WHERE id = ? FOR UPDATE;
-- Check capacity and deadline
INSERT INTO registrations ...;
UPDATE competitions SET seatsLeft = seatsLeft - 1, version = version + 1 
WHERE id = ? AND version = ?;
COMMIT;
```

### Queue Architecture

**Queues**:
- `registration`: Confirmation emails
- `reminder`: Pre-event notifications

**Processing**:
- Worker polls Redis queues
- Exponential backoff retry (2s, 4s, 8s)
- Failed jobs → DLQ after 3 attempts
- Cron enqueues bulk jobs daily

## 📡 API Endpoints

### Authentication
```bash
POST /api/auth/signup       # Register new user
POST /api/auth/login        # Login
```

### Competitions
```bash
GET    /api/competitions              # List all
GET    /api/competitions/:id          # Get details
POST   /api/competitions              # Create (organizer)
GET    /api/competitions/my-competitions  # Organizer's competitions
POST   /api/competitions/:id/register # Register (participant)
GET    /api/competitions/:id/registrations # Get registrations
```

### Registrations
```bash
GET    /api/competitions/registrations/my  # User's registrations
```

### Example cURL Commands

**Signup**:
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "PARTICIPANT"
  }'
```

**Create Competition**:
```bash
curl -X POST http://localhost:3001/api/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Hackathon 2025",
    "description": "48-hour coding competition",
    "tags": ["coding", "hackathon"],
    "capacity": 100,
    "regDeadline": "2025-12-31T23:59:59Z",
    "startDate": "2026-01-15T09:00:00Z"
  }'
```

**Register for Competition** (with idempotency):
```bash
curl -X POST http://localhost:3001/api/competitions/COMPETITION_ID/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Idempotency-Key: unique-key-12345" \
  -d '{}'
```

## 🧪 Testing

### Load Testing Registration Concurrency

```bash
# Install artillery
npm install -g artillery

# Create test script (artillery.yml)
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 10
      arrivalRate: 20
scenarios:
  - name: "Register for competition"
    flow:
      - post:
          url: "/api/competitions/{{competitionId}}/register"
          headers:
            Authorization: "Bearer {{token}}"
            Idempotency-Key: "test-{{$randomString()}}"

# Run test
artillery run artillery.yml
```

## 📊 Database Schema

Key models:
- **User**: id, email, name, password, role
- **Competition**: id, title, description, capacity, seatsLeft, regDeadline, version
- **Registration**: id, userId, competitionId, status, idempotencyKey (unique)
- **MailBox**: id, userId, to, subject, body (simulated emails)
- **IdempotencyLog**: key, response, expiresAt
- **FailedJob**: id, jobId, queue, payload, error, attempts

## 🔧 Configuration

### Environment Variables

**Backend** (`apps/backend/.env`):
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-min-32-chars
BACKEND_PORT=3001
WORKER_CONCURRENCY=5
CRON_REMINDER_SCHEDULE="0 0 * * *"
```

**Frontend** (`apps/frontend/.env`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Run migrations
docker-compose exec backend yarn prisma migrate deploy

# Seed database
docker-compose exec backend yarn prisma db seed

# Access database
docker-compose exec postgres psql -U postgres -d mini_compete

# Stop all services
docker-compose down

# Remove volumes (clean slate)
docker-compose down -v
```

## 🛠️ Development Commands

```bash
# Install dependencies
yarn install

# Generate Prisma client
yarn workspace @mini-compete/backend prisma generate

# Create migration
yarn workspace @mini-compete/backend prisma migrate dev --name migration_name

# Run Prisma Studio
yarn workspace @mini-compete/backend prisma studio

# Build all packages
yarn build

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format
```

## 📈 Monitoring & Debugging

### View Worker Jobs
```bash
# Redis CLI
docker-compose exec redis redis-cli

# List queues
KEYS bull:*

# View job details
HGETALL bull:registration:id
```

### Check Failed Jobs
```sql
-- In PostgreSQL
SELECT * FROM failed_jobs ORDER BY failed_at DESC;
```

### View Mailbox (Simulated Emails)
```sql
SELECT * FROM mailbox ORDER BY sent_at DESC;
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Redis Connection Issues
```bash
# Check Redis
docker-compose exec redis redis-cli ping

# Should return PONG
```

### Migration Issues
```bash
# Reset database (⚠️ destroys data)
yarn workspace @mini-compete/backend prisma migrate reset

# Push schema without migration
yarn workspace @mini-compete/backend prisma db push
```

## 📦 Production Deployment

1. **Set production environment variables**
2. **Build Docker images**
```bash
docker-compose -f docker-compose.yml build
```

3. **Run migrations**
```bash
docker-compose exec backend yarn prisma migrate deploy
```

4. **Scale workers** (if needed)
```bash
docker-compose up -d --scale worker=3
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [BullMQ](https://docs.bullmq.io/)
- [Turborepo](https://turbo.build/)