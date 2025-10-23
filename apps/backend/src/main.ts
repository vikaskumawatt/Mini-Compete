import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger/dist/swagger-module';
import { DocumentBuilder } from '@nestjs/swagger/dist/document-builder';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors({
    origin: configService.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Mini Compete API')
    .setDescription('Competition registration and management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || configService.get('BACKEND_PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Backend server running on http://0.0.0.0:${port}`);
  logger.log(`📚 API Documentation available at http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
