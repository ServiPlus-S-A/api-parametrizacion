import servicesConfig from './services.config';

describe('servicesConfig', () => {
  const ORIGINAL_ENV = process.env;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
    consoleWarnSpy.mockRestore();
  });

  it('should return empty array and warn if no services are registered', () => {
    process.env = {}; // Clear env
    const services = servicesConfig();
    expect(services).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[ServicesConfig] No services registered. Add SERVICES_{NAME}_URL env vars.',
    );
  });

  it('should parse valid service variables', () => {
    process.env.SERVICES_TEST_URL = 'http://localhost:3000';
    process.env.SERVICES_TEST_AUTH = 'false';
    process.env.SERVICES_OTHER_URL = 'http://localhost:3001'; // Default true auth

    const services = servicesConfig();

    expect(services).toHaveLength(2);
    expect(services).toContainEqual({
      name: 'test',
      targetUrl: 'http://localhost:3000',
      requiresAuth: false,
    });
    expect(services).toContainEqual({
      name: 'other',
      targetUrl: 'http://localhost:3001',
      requiresAuth: true,
    });
  });

  it('should warn and skip invalid URLs', () => {
    process.env.SERVICES_INVALID_URL = 'not-a-url';

    const services = servicesConfig();

    expect(services).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[ServicesConfig] Invalid URL for service "invalid": not-a-url — skipping',
      ),
    );
  });
});
