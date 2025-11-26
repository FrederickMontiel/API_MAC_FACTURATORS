import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global para capturar y formatear todas las excepciones HTTP
 * Proporciona respuestas consistentes para todos los errores
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Construir respuesta de error estructurada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.extractMessage(exceptionResponse),
      error: this.extractError(exceptionResponse),
      ...(typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? exceptionResponse
        : {}),
    };

    // Log del error
    this.logError(errorResponse, exception);

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }

  /**
   * Extrae el mensaje de error de la respuesta de la excepción
   */
  private extractMessage(exceptionResponse: string | object): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      return (exceptionResponse as any).message;
    }

    return 'Error en la solicitud';
  }

  /**
   * Extrae el tipo de error de la respuesta
   */
  private extractError(exceptionResponse: string | object): string {
    if (
      typeof exceptionResponse === 'object' &&
      'error' in exceptionResponse
    ) {
      return (exceptionResponse as any).error;
    }

    return 'Bad Request';
  }

  /**
   * Registra el error en los logs
   */
  private logError(errorResponse: any, exception: HttpException): void {
    const { statusCode, path, method, message } = errorResponse;

    if (statusCode >= 500) {
      this.logger.error(
        `${method} ${path} - ${statusCode} - ${JSON.stringify(message)}`,
        exception.stack,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `${method} ${path} - ${statusCode} - ${JSON.stringify(message)}`,
      );
    }
  }
}

/**
 * Filtro para capturar errores no controlados
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof Error
        ? exception.message
        : 'Error interno del servidor';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error: exception instanceof Error ? exception.name : 'InternalServerError',
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
    );

    response.status(status).json(errorResponse);
  }
}
