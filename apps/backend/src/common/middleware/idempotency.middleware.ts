import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to extract and validate Idempotency-Key header
 * This middleware doesn't enforce idempotency itself, but ensures the key is properly formatted
 */
@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(IdempotencyMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (idempotencyKey) {
      // Validate idempotency key format (simple validation)
      if (idempotencyKey.length < 10 || idempotencyKey.length > 255) {
        this.logger.warn(`Invalid idempotency key length: ${idempotencyKey.length}`);
        return res.status(400).json({
          statusCode: 400,
          message: 'Idempotency-Key must be between 10 and 255 characters',
          error: 'Bad Request',
        });
      }

      // Log for debugging
      this.logger.debug(`Idempotency key present: ${idempotencyKey.substring(0, 20)}...`);

      // Attach to request for easy access in controllers/services
      (req as any).idempotencyKey = idempotencyKey;
    }

    next();
  }
}
