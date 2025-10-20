# Mini Compete - Quick Reference Card

## 🚀 One-Liner Setup

```bash
git clone <repo> && cd mini-compete && ./setup.sh
```

## 📋 Essential Commands

```bash
# Start everything (Docker)
make docker-up

# Start development
make dev

# View logs
make logs

# Database
make studio    # GUI
make psql      # CLI

# Redis
make redis-cli

# Stop all
make stop
```

## 🔑 Test Accounts

```
Organizer:   organizer1@minicompete.com  / password123
Participant: participant1@minicompete.com / password123
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| API Docs | http://localhost:3001/api/docs |

## 📊 Project Stats

- **Files**: 90+
- **Code**: 10,000+ lines
- **Docs**: 10 comprehensive guides
- **Status**: ✅ Production-ready

## 🎯 Key Features

✅ Authentication (JWT)  
✅ Competition CRUD  
✅ Registration (idempotent)  
✅ Concurrency control (4 layers)  
✅ Background jobs (BullMQ)  
✅ Cron tasks  
✅ Docker deployment  

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| README.md | Main docs |
| QUICKSTART.md | 5-min setup |
| ARCHITECTURE.md | Design details |
| SETUP_COMPLETE_GUIDE.md | Detailed setup |
| CONTRIBUTING.md | How to contribute |
| DELIVERY_SUMMARY.md | Project status |

## 🐛 Quick Troubleshooting

```bash
# Port in use?
lsof -i :3000

# Database issues?
docker-compose restart postgres

# Redis issues?
docker exec -it mini-compete-redis redis-cli ping

# Prisma issues?
yarn workspace @mini-compete/backend prisma generate

# Start fresh?
make docker-down && make docker-up
```

## 🔧 Common Tasks

### Create Migration
```bash
cd apps/backend
yarn prisma migrate dev --name my_migration
```

### Run Tests
```bash
yarn test
yarn test:e2e
```

### Build for Production
```bash
yarn build
docker-compose build
```

## 📡 API Quick Reference

```bash
# Signup
POST /api/auth/signup
Body: { name, email, password, role }

# Login
POST /api/auth/login
Body: { email, password }

# Create Competition (Organizer)
POST /api/competitions
Headers: { Authorization: Bearer <token> }
Body: { title, description, capacity, regDeadline }

# Register (Participant)
POST /api/competitions/:id/register
Headers: { 
  Authorization: Bearer <token>,
  Idempotency-Key: <unique-key>
}
```

## 🎓 Learn More

- API Docs: `/api/docs`
- Postman: `postman/mini-compete.postman_collection.json`
- Architecture: `ARCHITECTURE.md`

---

**Quick Start**: `./setup.sh` → Choose option → Done! 🎉