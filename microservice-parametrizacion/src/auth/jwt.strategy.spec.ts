import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return payload', () => {
    const payload: JwtPayload = {
      sub: 'uuid',
      email: 'test@example.com',
      role: 'admin',
    };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: 'uuid',
      email: 'test@example.com',
      role: 'admin',
    });
  });

  describe('when JWT_SECRET is not set', () => {
    it('should fall back to default secretKey', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      const module: TestingModule = await Test.createTestingModule({
        providers: [JwtStrategy],
      }).compile();
      const strategyWithoutSecret = module.get<JwtStrategy>(JwtStrategy);
      expect(strategyWithoutSecret).toBeDefined();
      process.env.JWT_SECRET = originalSecret;
    });
  });
});
