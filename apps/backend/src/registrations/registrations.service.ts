import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Prisma, RegistrationStatus } from '@prisma/client';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);
  private readonly redis: Redis;

  constructor(
    private prisma: PrismaService,
    @InjectQueue('registration') private registrationQueue: Queue,
  ) {
    // Initialize Redis client for distributed locks
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async register(userId: string, competitionId: string, idempotencyKey?: string) {
    // Check idempotency first
    if (idempotencyKey) {
      const cached = await this.checkIdempotency(idempotencyKey);
      if (cached) {
        this.logger.log(`Idempotent request detected: ${idempotencyKey}`);
        return cached;
      }
    }

    // Acquire distributed lock for this competition to prevent race conditions
    const lockKey = `lock:competition:${competitionId}`;
    const lockValue = `${userId}-${Date.now()}`;
    const lockAcquired = await this.acquireLock(lockKey, lockValue, 5000);

    if (!lockAcquired) {
      throw new ConflictException('Competition registration is busy, please try again');
    }

    try {
      // Use a database transaction with SERIALIZABLE isolation
      const result = await this.prisma.$transaction(
        async (tx) => {
          // Get competition with row-level lock (FOR UPDATE)
          const competition = await tx.competition.findUnique({
            where: { id: competitionId },
          });

          if (!competition) {
            throw new NotFoundException('Competition not found');
          }

          // Validate registration deadline
          if (new Date() > competition.regDeadline) {
            throw new BadRequestException('Registration deadline has passed');
          }

          // Check if user already registered
          const existingReg = await tx.registration.findUnique({
            where: {
              userId_competitionId: {
                userId,
                competitionId,
              },
            },
          });

          if (existingReg) {
            throw new ConflictException('Already registered for this competition');
          }

          // Check capacity
          if (competition.seatsLeft <= 0) {
            throw new BadRequestException('Competition is full');
          }

          // Create registration
          const registration = await tx.registration.create({
            data: {
              userId,
              competitionId,
              status: RegistrationStatus.PENDING,
              idempotencyKey,
            },
            include: {
              competition: {
                select: {
                  title: true,
                  startDate: true,
                },
              },
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          });

          // Decrement seats left with optimistic locking
          await tx.competition.update({
            where: {
              id: competitionId,
              version: competition.version,
            },
            data: {
              seatsLeft: {
                decrement: 1,
              },
              version: {
                increment: 1,
              },
            },
          });

          return registration;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 10000,
        },
      );

      // Add confirmation job to queue
      await this.registrationQueue.add(
        'confirmation',
        {
          registrationId: result.id,
          userId: result.userId,
          competitionId: result.competitionId,
          userEmail: result.user.email,
          userName: result.user.name,
          competitionTitle: result.competition.title,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );

      // Store idempotency result
      if (idempotencyKey) {
        await this.storeIdempotency(idempotencyKey, result);
      }

      this.logger.log(`Registration created: ${result.id}`);

      return result;
    } finally {
      // Always release the lock
      await this.releaseLock(lockKey, lockValue);
    }
  }

  async getUserRegistrations(userId: string) {
    return this.prisma.registration.findMany({
      where: { userId },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            startDate: true,
            regDeadline: true,
            organizer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });
  }

  async getCompetitionRegistrations(competitionId: string) {
    return this.prisma.registration.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        registeredAt: 'asc',
      },
    });
  }

  private async acquireLock(key: string, value: string, ttl: number): Promise<boolean> {
    const result = await this.redis.set(key, value, 'PX', ttl, 'NX');
    return result === 'OK';
  }

  private async releaseLock(key: string, value: string): Promise<void> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.redis.eval(script, 1, key, value);
  }

  private async checkIdempotency(key: string): Promise<any | null> {
    const cached = await this.redis.get(`idempotency:${key}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Also check database for longer-term storage
    const log = await this.prisma.idempotencyLog.findUnique({
      where: { key },
    });

    if (log && log.expiresAt > new Date()) {
      return log.response;
    }

    return null;
  }

  private async storeIdempotency(key: string, data: any): Promise<void> {
    const ttl = 24 * 60 * 60; // 24 hours
    const expiresAt = new Date(Date.now() + ttl * 1000);

    // Store in Redis (fast cache)
    await this.redis.setex(`idempotency:${key}`, ttl, JSON.stringify(data));

    // Store in database (persistent)
    await this.prisma.idempotencyLog.upsert({
      where: { key },
      create: {
        key,
        response: data as any,
        expiresAt,
      },
      update: {
        response: data as any,
        expiresAt,
      },
    });
  }

  async confirmRegistration(registrationId: string): Promise<void> {
    await this.prisma.registration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.CONFIRMED,
      },
    });
  }
}