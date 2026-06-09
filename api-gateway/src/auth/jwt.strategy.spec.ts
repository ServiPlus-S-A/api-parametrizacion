import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should extract userId and username from payload', () => {
      const payload = { sub: '123', username: 'testuser' };
      const result = strategy.validate(payload);

      expect(result).toEqual({ userId: '123', username: 'testuser' });
    });
  });
});
