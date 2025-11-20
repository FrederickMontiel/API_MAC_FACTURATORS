import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    this.loggingService.logRequest(request, 'Incoming Request');

    return next.handle().pipe(
      tap((response) => {
        this.loggingService.logRequest({ ...request, response }, 'Outgoing Response');
      }),
      catchError((error) => {
        this.loggingService.logError(error, 'Request Error');
        throw error;
      }),
    );
  }
}