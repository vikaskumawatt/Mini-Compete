import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CronService } from './cron.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminder',
    }),
  ],
  providers: [CronService],
})
export class CronModule {}
