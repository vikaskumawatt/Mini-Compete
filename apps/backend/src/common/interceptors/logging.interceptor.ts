import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor to log all HTTP requests and responses
 * Useful for debugging and monitoring
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || 'unknown';
    const userId = request.user?.id || 'anonymous';

    const startTime = Date.now();

    // Log request
    this.logger.log(
      `➡️  ${method} ${url} - User: ${userId} - UA: ${userAgent.substring(0, 50)}`,
    );

    // Log body for POST/PUT/PATCH (excluding password fields)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;

          this.logger.log(
            `⬅️  ${method} ${url} - ${statusCode} - ${responseTime}ms`,
          );

          // Log response for debugging (optional, can be verbose)
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(`Response: ${JSON.stringify(data).substring(0, 200)}`);
          }
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = error.status || 500;
          const responseTime = Date.now() - startTime;

          this.logger.error(
            `⬅️  ${method} ${url} - ${statusCode} - ${responseTime}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * Remove sensitive fields from body before logging
   */
  private sanitizeBody(body: any): any {
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}