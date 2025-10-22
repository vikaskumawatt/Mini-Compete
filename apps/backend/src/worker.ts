import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Worker');

  const app = await NestFactory.createApplicationContext(AppModule);

  logger.log('🔄 Worker started and listening for jobs...');
  logger.log('📋 Registered queues: registration, reminder');

  // Keep the process alive
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down worker...');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down worker...');
    await app.close();
    process.exit(0);
  });
}

bootstrap();
