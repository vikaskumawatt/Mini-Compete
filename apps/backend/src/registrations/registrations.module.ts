import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    BullModule.registerQueue({
      name: 'registration',
    }),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
