import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('registration') private registrationQueue: Queue,
    @InjectQueue('reminder') private reminderQueue: Queue,
  ) {}

  /**
   * Add a registration confirmation job to the queue
   */
  async addConfirmationJob(data: {
    registrationId: string;
    userId: string;
    competitionId: string;
    userEmail: string;
    userName: string;
    competitionTitle: string;
  }): Promise<Job> {
    this.logger.log(`Adding confirmation job for registration ${data.registrationId}`);

    return this.registrationQueue.add('confirmation', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    });
  }

  /**
   * Add a reminder notification job to the queue
   */
  async addReminderJob(data: {
    registrationId: string;
    userId: string;
    userEmail: string;
    userName: string;
    competitionTitle: string;
    startDate: Date;
  }): Promise<Job> {
    this.logger.log(`Adding reminder job for registration ${data.registrationId}`);

    return this.reminderQueue.add('notify', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 1000,
    });
  }

  /**
   * Get registration queue statistics
   */
  async getRegistrationQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.registrationQueue.getWaitingCount(),
      this.registrationQueue.getActiveCount(),
      this.registrationQueue.getCompletedCount(),
      this.registrationQueue.getFailedCount(),
      this.registrationQueue.getDelayedCount(),
    ]);

    return {
      queue: 'registration',
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * Get reminder queue statistics
   */
  async getReminderQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.reminderQueue.getWaitingCount(),
      this.reminderQueue.getActiveCount(),
      this.reminderQueue.getCompletedCount(),
      this.reminderQueue.getFailedCount(),
      this.reminderQueue.getDelayedCount(),
    ]);

    return {
      queue: 'reminder',
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  /**
   * Get all queues statistics
   */
  async getAllQueuesStats() {
    const [registration, reminder] = await Promise.all([
      this.getRegistrationQueueStats(),
      this.getReminderQueueStats(),
    ]);

    return {
      queues: [registration, reminder],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: 'registration' | 'reminder'): Promise<void> {
    const queue = queueName === 'registration' ? this.registrationQueue : this.reminderQueue;
    await queue.pause();
    this.logger.warn(`Queue ${queueName} paused`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: 'registration' | 'reminder'): Promise<void> {
    const queue = queueName === 'registration' ? this.registrationQueue : this.reminderQueue;
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  /**
   * Clean completed jobs older than specified age
   */
  async cleanCompletedJobs(
    queueName: 'registration' | 'reminder',
    olderThanMs: number = 86400000,
  ): Promise<number> {
    const queue = queueName === 'registration' ? this.registrationQueue : this.reminderQueue;
    const jobs = await queue.clean(olderThanMs, 'completed');
    this.logger.log(`Cleaned ${jobs.length} completed jobs from ${queueName} queue`);
    return jobs.length;
  }

  /**
   * Clean failed jobs older than specified age
   */
  async cleanFailedJobs(
    queueName: 'registration' | 'reminder',
    olderThanMs: number = 604800000,
  ): Promise<number> {
    const queue = queueName === 'registration' ? this.registrationQueue : this.reminderQueue;
    const jobs = await queue.clean(olderThanMs, 'failed');
    this.logger.log(`Cleaned ${jobs.length} failed jobs from ${queueName} queue`);
    return jobs.length;
  }
}
