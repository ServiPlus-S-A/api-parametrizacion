import { CircuitBreakerInterceptor } from './circuit-breaker.interceptor';
import {
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { of, throwError, TimeoutError } from 'rxjs';

describe('CircuitBreakerInterceptor', () => {
  let interceptor: CircuitBreakerInterceptor;

  beforeEach(() => {
    interceptor = new CircuitBreakerInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through successful calls', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => of('success data'),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (val) => {
        expect(val).toBe('success data');
        done();
      },
    });
  });

  it('should throw RequestTimeoutException on TimeoutError', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new TimeoutError()),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (err) => {
        expect(err).toBeInstanceOf(RequestTimeoutException);
        done();
      },
    });
  });
});
