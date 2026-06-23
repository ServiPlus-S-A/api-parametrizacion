import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should return user if user is present and no error occurs', () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const result = guard.handleRequest(null, mockUser);
    expect(result).toBe(mockUser);
  });

  it('should throw UnauthorizedException if user is missing and no error occurs', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw original error if error is passed', () => {
    const originalError = new Error('JWT token expired');
    expect(() => guard.handleRequest(originalError, null)).toThrow(
      originalError,
    );
  });
});
