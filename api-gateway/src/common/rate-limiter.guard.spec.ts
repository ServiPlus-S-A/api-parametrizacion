import { RateLimiterGuard } from './rate-limiter.guard';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;

  beforeEach(() => {
    guard = new RateLimiterGuard();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (ipAddress: string) => {
    const mockRequest = { ip: ipAddress } as Request;
    const mockHttp = jest.fn().mockReturnValue({
      getRequest: () => mockRequest,
    });
    return {
      switchToHttp: mockHttp,
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow first request and initialize counter', () => {
      const context = createMockContext('192.168.1.1');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow requests within limit', () => {
      const context = createMockContext('192.168.1.2');
      for (let i = 0; i < 50; i++) {
        expect(guard.canActivate(context)).toBe(true);
      }
    });

    it('should throw HttpException when limit is exceeded', () => {
      const context = createMockContext('192.168.1.3');
      for (let i = 0; i < 100; i++) {
        expect(guard.canActivate(context)).toBe(true);
      }

      expect(() => guard.canActivate(context)).toThrow(HttpException);
      try {
        guard.canActivate(context);
      } catch (e) {
        expect((e as HttpException).getStatus()).toBe(
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    });

    it('should reset count after time window expires', () => {
      const context = createMockContext('192.168.1.4');
      for (let i = 0; i < 100; i++) {
        expect(guard.canActivate(context)).toBe(true);
      }

      expect(() => guard.canActivate(context)).toThrow(HttpException);

      // Advance time by 61 seconds (WINDOW_MS is 60000)
      jest.advanceTimersByTime(61000);

      // Should be allowed again
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should handle request without IP', () => {
      const context = createMockContext(undefined as unknown as string);
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
