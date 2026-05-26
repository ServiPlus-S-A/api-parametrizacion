import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly WINDOW_MS = 60000; // 1 minute
  private readonly MAX_REQUESTS = 100;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || 'unknown';
    
    const now = Date.now();
    const record = this.requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(ip, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    record.count++;
    return true;
  }
}
