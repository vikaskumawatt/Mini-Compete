import { Process, Processor, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { RegistrationStatus } from '@prisma/client';

interface ConfirmationJobData {
  registrationId: string;
  userId: string;
  competitionId: string;
  userEmail: string;
  userName: string;
  competitionTitle: string;
}

@Processor('registration')
export class RegistrationProcessor {
  private readonly logger = new Logger(RegistrationProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('confirmation')
  async handleConfirmation(job: Job<ConfirmationJobData>) {
    this.logger.log(
      `Processing confirmation job ${job.id} for registration ${job.data.registrationId}`,
    );

    try {
      // Verify registration still exists and is valid
      const registration = await this.prisma.registration.findUnique({
        where: { id: job.data.registrationId },
        include: {
          competition: true,
          user: true,
        },
      });

      if (!registration) {
        this.logger.warn(`Registration ${job.data.registrationId} not found`);
        return { success: false, reason: 'Registration not found' };
      }

      if (registration.status === RegistrationStatus.CONFIRMED) {
        this.logger.log(`Registration ${job.data.registrationId} already confirmed`);
        return { success: true, reason: 'Already confirmed' };
      }

      // Simulate sending confirmation email by writing to MailBox
      await this.prisma.mailBox.create({
        data: {
          userId: job.data.userId,
          to: job.data.userEmail,
          subject: `Registration Confirmed: ${job.data.competitionTitle}`,
          body: `
Dear ${job.data.userName},

Your registration for "${job.data.competitionTitle}" has been confirmed!

Competition Details:
- Title: ${job.data.competitionTitle}
- Start Date: ${registration.competition.startDate ? new Date(registration.competition.startDate).toLocaleDateString() : 'TBD'}
- Registration ID: ${job.data.registrationId}

We look forward to seeing you at the event!

Best regards,
Mini Compete Team
          `.trim(),
        },
      });

      // Update registration status
      await this.prisma.registration.update({
        where: { id: job.data.registrationId },
        data: {
          status: RegistrationStatus.CONFIRMED,
        },
      });

      this.logger.log(`Confirmation email sent for registration ${job.data.registrationId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing confirmation job ${job.id}:`, error);
      throw error; // Re-throw to trigger retry
    }
  }

  @OnQueueFailed()
  async handleFailedJob(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed after ${job.attemptsMade} attempts:`, error.message);

    // Move to Dead Letter Queue after max attempts
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      try {
        await this.prisma.failedJob.create({
          data: {
            jobId: job.id.toString(),
            queue: 'registration',
            payload: job.data as any,
            error: error.message,
            attempts: job.attemptsMade,
          },
        });

        this.logger.warn(`Job ${job.id} moved to Dead Letter Queue`);
      } catch (dlqError) {
        this.logger.error(`Failed to move job ${job.id} to DLQ:`, dlqError);
      }
    }
  }
}
