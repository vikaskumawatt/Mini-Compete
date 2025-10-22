import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegistrationProcessor } from './processors/registration.processor';
import { ReminderProcessor } from './processors/reminder.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'registration',
      },
      {
        name: 'reminder',
      },
    ),
  ],
  providers: [RegistrationProcessor, ReminderProcessor],
  exports: [BullModule],
})
export class QueueModule {}
