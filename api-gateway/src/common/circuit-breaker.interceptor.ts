import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class CircuitBreakerInterceptor implements NestInterceptor {
  private isCircuitOpen = false;
  private failureCount = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly TIMEOUT_MS = 3000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (this.isCircuitOpen) {
      return throwError(
        () =>
          new ServiceUnavailableException(
            'Service is currently unavailable (Circuit Open)',
          ),
      );
    }

    return next.handle().pipe(
      timeout(this.TIMEOUT_MS),
      catchError((err: unknown) => {
        const errorResponse = (err as Record<string, unknown>)?.response as
          | Record<string, unknown>
          | undefined;
        if (
          err instanceof TimeoutError ||
          (errorResponse?.status && Number(errorResponse.status) >= 500)
        ) {
          this.failureCount++;
          if (this.failureCount >= this.FAILURE_THRESHOLD) {
            this.isCircuitOpen = true;
            setTimeout(() => {
              this.isCircuitOpen = false;
              this.failureCount = 0;
            }, 10000);
          }
          return throwError(
            () =>
              new RequestTimeoutException(
                'Microservice timeout or internal error',
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
