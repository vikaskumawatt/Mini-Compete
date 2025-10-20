import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('reminder') private reminderQueue: Queue,
  ) {}

  // Run every day at midnight (or every minute in dev for testing)
  @Cron(process.env.NODE_ENV === 'development' ? CronExpression.EVERY_MINUTE : CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendUpcomingReminders() {
    this.logger.log('🕐 Running reminder cron job');

    try {
      const now = new Date();
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Find competitions starting in the next 24 hours
      const upcomingCompetitions = await this.prisma.competition.findMany({
        where: {
          startDate: {
            gte: now,
            lte: twentyFourHoursFromNow,
          },
        },
        include: {
          registrations: {
            where: {
              status: RegistrationStatus.CONFIRMED,
            },
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      let jobsEnqueued = 0;

      for (const competition of upcomingCompetitions) {
        this.logger.log(`Processing reminders for competition: ${competition.title}`);

        for (const registration of competition.registrations) {
          await this.reminderQueue.add(
            'notify',
            {
              registrationId: registration.id,
              userId: registration.userId,
              userEmail: registration.user.email,
              userName: registration.user.name,
              competitionTitle: competition.title,
              startDate: competition.startDate,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
            },
          );

          jobsEnqueued++;
        }
      }

      this.logger.log(`✅ Reminder cron completed: ${jobsEnqueued} jobs enqueued for ${upcomingCompetitions.length} competitions`);
    } catch (error) {
      this.logger.error('❌ Error in reminder cron job:', error);
    }
  }

  // Run every day at 2 AM to clean up old data
  @Cron(process.env.NODE_ENV === 'development' ? '0 */6 * * *' : '0 2 * * *')
  async cleanupOldData() {
    this.logger.log('🧹 Running cleanup cron job');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Delete expired idempotency logs
      const deletedIdempotency = await this.prisma.idempotencyLog.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Archive or delete old failed jobs (older than 30 days)
      const deletedFailedJobs = await this.prisma.failedJob.deleteMany({
        where: {
          failedAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      this.logger.log(
        `✅ Cleanup completed: ${deletedIdempotency.count} idempotency logs, ${deletedFailedJobs.count} failed jobs deleted`,
      );
    } catch (error) {
      this.logger.error('❌ Error in cleanup cron job:', error);
    }
  }
}