# Complete Setup & Run Guide

This guide provides step-by-step instructions to get Mini Compete running on your machine.

## 📋 Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js (requires 18+)
node --version

# Check Yarn
yarn --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version
```

If any are missing, install them:

- **Node.js**: https://nodejs.org/
- **Yarn**: `npm install -g yarn`
- **Docker**: https://docs.docker.com/get-docker/

## 🚀 Method 1: Automated Setup (Easiest)

### Using the Setup Script

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd mini-compete

# 2. Make setup script executable
chmod +x setup.sh

# 3. Run setup script
./setup.sh
```

The script will:

- Check prerequisites
- Let you choose Docker or Local setup
- Configure environment files
- Generate secure JWT secret
- Start services
- Run migrations and seed data

**That's it!** Skip to the [Access section](#-accessing-the-application).

## 🛠️ Method 2: Manual Setup (Step-by-Step)

### For Docker Deployment

#### Step 1: Clone and Configure

```bash
# Clone repository
git clone <your-repo-url>
cd mini-compete

# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
```

#### Step 2: Configure JWT Secret

Open `apps/backend/.env` and update:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
```

Generate a secure secret:

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use any random string generator
```

#### Step 3: Start Services

```bash
# Start all services
docker-compose up -d

# Wait for services to initialize (~10 seconds)
sleep 10

# Check service status
docker-compose ps
```

#### Step 4: Setup Database

```bash
# Run migrations
docker-compose exec backend yarn prisma migrate deploy

# Seed test data
docker-compose exec backend yarn prisma db seed
```

#### Step 5: Verify

```bash
# Check logs
docker-compose logs -f backend

# Test API health
curl http://localhost:3001/api/health
```

### For Local Development

#### Step 1: Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd mini-compete

# Install all packages
yarn install
```

#### Step 2: Start Infrastructure

```bash
# Option A: Using Docker Compose (Recommended)
docker-compose -f docker-compose.dev.yml up -d

# Option B: Using Make
make dev-services

# Verify services are running
docker ps
```

#### Step 3: Configure Environment

```bash
# Copy backend environment file
cp apps/backend/.env.example apps/backend/.env

# Edit apps/backend/.env and set:
# - DATABASE_URL (should be correct by default)
# - JWT_SECRET (generate a secure random string)
# - Other variables as needed
```

#### Step 4: Setup Database

```bash
# Generate Prisma Client
yarn workspace @mini-compete/backend prisma generate

# Run migrations
yarn workspace @mini-compete/backend prisma migrate dev

# Seed database
yarn workspace @mini-compete/backend prisma db seed
```

#### Step 5: Start Development Servers

Open **three terminal windows**:

```bash
# Terminal 1: Backend API
yarn workspace @mini-compete/backend dev
# Runs on http://localhost:3001

# Terminal 2: Worker (Background Jobs)
yarn workspace @mini-compete/backend worker
# Processes queue jobs

# Terminal 3: Frontend
yarn workspace @mini-compete/frontend dev
# Runs on http://localhost:3000
```

**Alternative** (using Make):

```bash
make dev
```

## 🌐 Accessing the Application

Once setup is complete, you can access:

| Service           | URL                            | Description           |
| ----------------- | ------------------------------ | --------------------- |
| **Frontend**      | http://localhost:3000          | User interface        |
| **Backend API**   | http://localhost:3001          | REST API              |
| **API Docs**      | http://localhost:3001/api/docs | Swagger documentation |
| **Prisma Studio** | Run `make studio`              | Database GUI          |

## 🔑 Test Credentials

After seeding, login with these accounts:

### Organizers (Can create competitions)

```
Email: organizer1@minicompete.com
Password: password123

Email: organizer2@minicompete.com
Password: password123
```

### Participants (Can register for competitions)

```
Email: participant1@minicompete.com
Password: password123

Email: participant2@minicompete.com
Password: password123
```

## 📝 Quick Workflow Test

### 1. Test as Participant

```bash
# Via UI
1. Go to http://localhost:3000
2. Click "Login"
3. Login as participant1@minicompete.com
4. Browse competitions
5. Click a competition → "Register Now"
6. Check your mailbox (simulated emails)

# Via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "participant1@minicompete.com",
    "password": "password123"
  }'

# Save the token, then register
curl -X POST http://localhost:3001/api/competitions/{id}/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: test-$(date +%s)"
```

### 2. Test as Organizer

```bash
# Via UI
1. Logout and login as organizer1@minicompete.com
2. Click "Dashboard"
3. Click "Create Competition"
4. Fill form and submit
5. View your competitions

# Via API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "organizer1@minicompete.com",
    "password": "password123"
  }'

# Create competition
curl -X POST http://localhost:3001/api/competitions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Competition",
    "description": "My test competition",
    "tags": ["test"],
    "capacity": 50,
    "regDeadline": "2025-12-31T23:59:59Z"
  }'
```

### 3. Test Idempotency

```bash
# Register with same idempotency key twice
IDEMPOTENCY_KEY="test-$(date +%s)"

# First request (creates registration)
curl -X POST http://localhost:3001/api/competitions/{id}/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"

# Second request (returns cached response)
curl -X POST http://localhost:3001/api/competitions/{id}/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"
```

## 🔍 Verification & Debugging

### Check Service Health

```bash
# Check all services
make health

# Or individually
curl http://localhost:3001/api/health | jq .
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend

# Using Make
make logs
make logs-backend
make logs-worker
```

### Check Database

```bash
# Open Prisma Studio (GUI)
make studio

# Or connect via psql
make psql

# Then run SQL
SELECT * FROM users;
SELECT * FROM competitions;
SELECT * FROM registrations;
SELECT * FROM mailbox ORDER BY sent_at DESC LIMIT 10;
```

### Check Redis Queue

```bash
# Connect to Redis
make redis-cli

# Check queues
KEYS bull:*

# View job counts
HGETALL bull:registration:counts
HGETALL bull:reminder:counts
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # Postgres
lsof -i :6379  # Redis

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if Postgres is running
docker ps | grep postgres

# Restart Postgres
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Failed

```bash
# Check if Redis is running
docker ps | grep redis

# Test connection
docker exec -it mini-compete-redis redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma Client
yarn workspace @mini-compete/backend prisma generate

# If still issues, clean and rebuild
rm -rf apps/backend/node_modules/.prisma
yarn workspace @mini-compete/backend prisma generate
```

### Worker Not Processing Jobs

```bash
# Check worker is running
docker ps | grep worker

# Check worker logs
docker-compose logs -f worker

# Verify Redis connection
docker exec -it mini-compete-redis redis-cli
> KEYS bull:*
> LLEN bull:registration:waiting
```

### Frontend Build Errors

```bash
# Clear Next.js cache
rm -rf apps/frontend/.next

# Reinstall dependencies
rm -rf apps/frontend/node_modules
yarn install

# Rebuild
yarn workspace @mini-compete/frontend build
```

### Migration Errors

```bash
# Reset database (⚠️ destroys all data)
yarn workspace @mini-compete/backend prisma migrate reset

# Or using Make
make reset

# Then re-seed
make seed
```

## 🛑 Stopping Services

### Docker Setup

```bash
# Stop services (keeps data)
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Using Make
make stop
make docker-down
```

### Local Development

```bash
# Stop development servers: Ctrl+C in each terminal

# Stop infrastructure
docker-compose -f docker-compose.dev.yml down

# Or using Make
make stop
```

## 🔄 Restarting Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart worker

# Full restart (down then up)
docker-compose down && docker-compose up -d
```

## 📦 Importing Postman Collection

1. Open Postman
2. Click "Import"
3. Select `postman/mini-compete.postman_collection.json`
4. Update collection variables:
   - `baseUrl`: http://localhost:3001/api
   - `token`: (will be set automatically after login)

## 🎯 Next Steps

Once everything is running:

1. **Explore the UI**: Browse competitions, register, create new ones
2. **Test the API**: Import Postman collection and try endpoints
3. **View Documentation**: Visit http://localhost:3001/api/docs
4. **Check Mailbox**: View simulated emails in database
5. **Monitor Queues**: Watch worker process jobs in real-time
6. **Read Architecture**: Review ARCHITECTURE.md for design details

## 📚 Additional Resources

- **README.md**: Complete project documentation
- **ARCHITECTURE.md**: Design decisions and trade-offs
- **QUICKSTART.md**: Condensed setup guide
- **CONTRIBUTING.md**: How to contribute
- **Makefile**: List all available commands with `make help`

## 💬 Need Help?

- Check [Troubleshooting section](#-troubleshooting)
- Review logs: `make logs`
- Open an issue on GitHub
- Check API docs: http://localhost:3001/api/docs

---

**Congratulations! 🎉 Mini Compete is now running!**
