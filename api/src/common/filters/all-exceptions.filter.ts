import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { buildErrorResponse } from './error-response.js';

interface HttpExceptionBody {
  message?: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const details: HttpExceptionBody =
        typeof body === 'string'
          ? { message: body }
          : (body as HttpExceptionBody);

      response.status(status).json(
        buildErrorResponse({
          status,
          message: details.message ?? exception.message,
          error: details.error,
          path: request.url,
        }),
      );
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    this.logger.error(
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : String(exception),
    );
    response.status(status).json(
      buildErrorResponse({
        status,
        message: 'Internal server error',
        path: request.url,
      }),
    );
  }
}
