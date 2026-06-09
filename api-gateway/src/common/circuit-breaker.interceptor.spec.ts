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

  it('should throw ServiceUnavailableException when circuit is open', (done) => {
    jest.useFakeTimers();
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new TimeoutError()),
    };

    // Fail 3 times to open circuit
    interceptor
      .intercept(mockContext, mockCallHandler)
      .subscribe({ error: () => {} });
    interceptor
      .intercept(mockContext, mockCallHandler)
      .subscribe({ error: () => {} });
    interceptor
      .intercept(mockContext, mockCallHandler)
      .subscribe({ error: () => {} });

    // 4th call should throw ServiceUnavailableException
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (err: Error) => {
        expect(err.message).toBe(
          'Service is currently unavailable (Circuit Open)',
        );

        // Advance timers to close circuit
        jest.advanceTimersByTime(11000);
        jest.useRealTimers();
        done();
      },
    });
  });

  it('should pass through generic errors', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new Error('Generic error')),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (err: Error) => {
        expect(err.message).toBe('Generic error');
        done();
      },
    });
  });
});
