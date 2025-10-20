import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

interface ReminderJobData {
  registrationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  competitionTitle: string;
  startDate: Date;
}

@Processor('reminder')
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('notify')
  async handleReminder(job: Job<ReminderJobData>) {
    this.logger.log(`Processing reminder job ${job.id} for registration ${job.data.registrationId}`);

    try {
      // Verify registration still exists
      const registration = await this.prisma.registration.findUnique({
        where: { id: job.data.registrationId },
      });

      if (!registration) {
        this.logger.warn(`Registration ${job.data.registrationId} not found`);
        return { success: false, reason: 'Registration not found' };
      }

      // Send reminder email by writing to MailBox
      await this.prisma.mailBox.create({
        data: {
          userId: job.data.userId,
          to: job.data.userEmail,
          subject: `Reminder: ${job.data.competitionTitle} starts soon!`,
          body: `
Dear ${job.data.userName},

This is a friendly reminder that "${job.data.competitionTitle}" is starting soon!

Event Date: ${new Date(job.data.startDate).toLocaleString()}

Please make sure you're prepared and ready to participate.

Good luck!

Best regards,
Mini Compete Team
          `.trim(),
        },
      });

      this.logger.log(`Reminder sent for registration ${job.data.registrationId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing reminder job ${job.id}:`, error);
      throw error;
    }
  }

  @OnQueueFailed()
  async handleFailedJob(job: Job, error: Error) {
    this.logger.error(`Reminder job ${job.id} failed:`, error.message);

    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      try {
        await this.prisma.failedJob.create({
          data: {
            jobId: job.id.toString(),
            queue: 'reminder',
            payload: job.data as any,
            error: error.message,
            attempts: job.attemptsMade,
          },
        });
      } catch (dlqError) {
        this.logger.error(`Failed to move reminder job ${job.id} to DLQ:`, dlqError);
      }
    }
  }
}