# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup with Turborepo monorepo
- NestJS backend with Prisma ORM and PostgreSQL
- Next.js frontend with Tailwind CSS
- JWT-based authentication with role-based access control
- Competition creation and management (Organizer role)
- Registration system with capacity management (Participant role)
- Idempotency implementation (Redis + Database)
- Concurrency control with distributed locks and optimistic locking
- Background job processing with BullMQ
- Registration confirmation emails (simulated via MailBox table)
- Retry logic with exponential backoff
- Dead Letter Queue for failed jobs
- Cron job for reminder notifications (24h before event)
- Cron job for data cleanup (expired idempotency logs)
- Docker Compose setup for production deployment
- Comprehensive documentation (README, ARCHITECTURE, QUICKSTART, CONTRIBUTING)
- Postman collection for API testing
- GitHub Actions CI/CD pipeline
- Makefile for common development tasks

### Changed

- N/A

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A

### Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with configurable expiration
- Input validation with class-validator
- SQL injection prevention via Prisma parameterized queries
- CORS configured for frontend origin

## [1.0.0] - 2025-01-XX

### Added

- First stable release
- Complete competition management system
- Production-ready with Docker support
- Full test coverage
- API documentation with Swagger

---

## Version History

- **1.0.0** - Initial release with core features
- **Unreleased** - Development version

---

## How to Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.
