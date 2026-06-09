import gatewayConfig from './gateway.config';

describe('gatewayConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should return valid config when all env variables are set', () => {
    process.env.PORT = '3000';
    process.env.JWT_SECRET = 'supersecret';
    process.env.RATE_LIMIT_WINDOW_MS = '60000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';

    const config = gatewayConfig();

    expect(config.port).toBe(3000);
    expect(config.jwtSecret).toBe('supersecret');
    expect(config.rateLimit.windowMs).toBe(60000);
    expect(config.rateLimit.maxRequests).toBe(100);
  });

  it('should throw an error if PORT is missing', () => {
    delete process.env.PORT;
    expect(() => gatewayConfig()).toThrow(
      'Missing required environment variable: PORT',
    );
  });

  it('should throw an error if JWT_SECRET is empty string', () => {
    process.env.PORT = '3000';
    process.env.JWT_SECRET = '';
    expect(() => gatewayConfig()).toThrow(
      'Missing required environment variable: JWT_SECRET',
    );
  });
});
