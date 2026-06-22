import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    // Set a dummy secret for testing
    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return payload', async () => {
    const payload = { sub: 'uuid', email: 'test@example.com', role: 'admin' };
    const result = await strategy.validate(payload);
    expect(result).toEqual({ 
      userId: 'uuid', 
      email: 'test@example.com', 
      role: 'admin', 
      sub: 'uuid' 
    });
  });
});
