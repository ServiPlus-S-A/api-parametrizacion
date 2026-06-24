import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ProxyMiddleware } from './proxy.middleware';
import { ServiceRegistryService } from './service-registry.service';
import { Request, Response } from 'express';

// Mock http-proxy-middleware
const mockProxyFn = jest.fn();
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn(() => mockProxyFn),
}));

function createMockReq(overrides: Record<string, unknown> = {}): Request {
  return {
    path: '/api/parametrizacion/services',
    method: 'GET',
    headers: { authorization: 'Bearer token123' },
    ...overrides,
  } as unknown as Request;
}

describe('ProxyMiddleware', () => {
  let middleware: ProxyMiddleware;
  let registry: ServiceRegistryService;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    proxyMockModule.createProxyMiddleware.mockClear();

    registry = new ServiceRegistryService([
      {
        name: 'parametrizacion',
        targetUrl: 'http://microservice:3001',
        requiresAuth: false,
      },
      {
        name: 'catalogo',
        targetUrl: 'http://microservice-catalogo:3002',
        requiresAuth: false,
      },
      {
        name: 'docs',
        targetUrl: 'http://microservice:3001',
        requiresAuth: false,
      },
      {
        name: 'secure',
        targetUrl: 'http://secure-service:3003',
        requiresAuth: true,
      },
    ]);

    middleware = new ProxyMiddleware(registry);
    mockRes = {};
    mockNext = jest.fn();
    mockProxyFn.mockReset();
  });

  it('should proxy request to registered service', () => {
    middleware.use(createMockReq(), mockRes as Response, mockNext);
    expect(mockProxyFn).toHaveBeenCalled();
  });

  it('should throw NotFoundException for unknown service', () => {
    const req = createMockReq({ path: '/api/unknown/resource' });

    expect(() => {
      middleware.use(req, mockRes as Response, mockNext);
    }).toThrow(NotFoundException);
  });

  it('should extract registered service name from versioned path', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    const req = createMockReq({ path: '/api/v1/parametrizacion/resource' });
    middleware.use(req, mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as {
      target: string;
      pathRewrite: (
        path: string,
        req: { originalUrl?: string; url?: string },
      ) => string;
    };

    expect(options.target).toBe('http://microservice:3001');
    expect(
      options.pathRewrite('/api/v1/parametrizacion/resource', {
        originalUrl: '/api/v1/parametrizacion/resource',
      }),
    ).toBe('/resource');
    expect(mockProxyFn).toHaveBeenCalled();
  });

  it('should route direct versioned api paths through parametrizacion service', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    const req = createMockReq({
      path: '/api/v1/auth/login',
      originalUrl: '/api/v1/auth/login',
      method: 'POST',
      headers: {},
    });

    middleware.use(req, mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as {
      target: string;
      pathRewrite: (
        path: string,
        req: { originalUrl?: string; url?: string },
      ) => string;
    };

    expect(options.target).toBe('http://microservice:3001');
    expect(
      options.pathRewrite('/', { originalUrl: '/api/v1/auth/login', url: '/' }),
    ).toBe('/api/v1/auth/login');
    expect(mockProxyFn).toHaveBeenCalled();
  });

  it('should preserve direct versioned endpoint paths with query params', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    const req = createMockReq({
      path: '/api/v1/roles/123',
      originalUrl: '/api/v1/roles/123?include=permissions',
      headers: {},
    });

    middleware.use(req, mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as {
      target: string;
      pathRewrite: (
        path: string,
        req: { originalUrl?: string; url?: string },
      ) => string;
    };

    expect(options.target).toBe('http://microservice:3001');
    expect(
      options.pathRewrite('/', {
        originalUrl: '/api/v1/roles/123?include=permissions',
        url: '/',
      }),
    ).toBe('/api/v1/roles/123?include=permissions');
  });

  it('should call next() for non-api paths', () => {
    const req = createMockReq({ path: '/health' });

    middleware.use(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockProxyFn).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when auth required but no header', () => {
    const req = createMockReq({ path: '/api/secure/resource', headers: {} });

    expect(() => {
      middleware.use(req, mockRes as Response, mockNext);
    }).toThrow(UnauthorizedException);
  });

  it('should allow unauthenticated access to services with requiresAuth=false', () => {
    const req = createMockReq({ path: '/api/catalogo/products', headers: {} });

    middleware.use(req, mockRes as Response, mockNext);

    expect(mockProxyFn).toHaveBeenCalled();
  });

  it('should redirect swagger ui base path to trailing slash', () => {
    const req = createMockReq({
      path: '/api/docs',
      originalUrl: '/api/docs',
    });
    const res = {
      redirect: jest.fn(),
    };

    middleware.use(req, res as unknown as Response, mockNext);

    expect(res.redirect).toHaveBeenCalledWith(301, '/api/docs/');
    expect(mockProxyFn).not.toHaveBeenCalled();
  });

  it('should route swagger json path through docs service', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    const req = createMockReq({
      path: '/api/docs-json',
      originalUrl: '/api/docs-json',
      headers: {},
    });

    middleware.use(req, mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as {
      target: string;
      pathRewrite: (
        path: string,
        req: { originalUrl?: string; url?: string },
      ) => string;
    };

    expect(options.target).toBe('http://microservice:3001');
    expect(
      options.pathRewrite('/', { originalUrl: '/api/docs-json', url: '/' }),
    ).toBe('/api/docs-json');
    expect(mockProxyFn).toHaveBeenCalled();
  });

  it('should preserve swagger asset paths when proxying docs service', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    const req = createMockReq({
      path: '/api/docs/swagger-ui.css',
      originalUrl: '/api/docs/swagger-ui.css',
      headers: {},
    });

    middleware.use(req, mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as {
      target: string;
      pathRewrite: (
        path: string,
        req: { originalUrl?: string; url?: string },
      ) => string;
    };

    expect(options.target).toBe('http://microservice:3001');
    expect(
      options.pathRewrite('/', {
        originalUrl: '/api/docs/swagger-ui.css',
        url: '/',
      }),
    ).toBe('/api/docs/swagger-ui.css');
  });

  it('should reuse cached proxy for same service', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };
    proxyMockModule.createProxyMiddleware.mockClear();
    const req = createMockReq();

    middleware.use(req, mockRes as Response, mockNext);
    middleware.use(req, mockRes as Response, mockNext);

    // Should only create proxy once, reuse from cache
    expect(proxyMockModule.createProxyMiddleware).toHaveBeenCalledTimes(1);
  });

  type MockOptions = {
    on: {
      proxyReq: (proxyReq: unknown, req: unknown) => void;
      error: (err: Error, req: unknown, res: unknown) => void;
      proxyRes: (proxyRes: unknown, req: unknown) => void;
    };
  };

  it('should set headers in proxyReq callback', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };

    middleware.use(createMockReq(), mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as MockOptions;
    const proxyReq = { setHeader: jest.fn() };
    const req = { headers: { host: 'localhost:3000' } };

    options.on.proxyReq(proxyReq, req);

    expect(proxyReq.setHeader).toHaveBeenCalledWith(
      'X-Gateway-Service',
      'parametrizacion',
    );
    expect(proxyReq.setHeader).toHaveBeenCalledWith(
      'X-Forwarded-Host',
      'localhost:3000',
    );
    expect(proxyReq.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      expect.any(String),
    );
  });

  it('should handle errors in error callback', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };

    middleware.use(createMockReq(), mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as MockOptions;
    const err = new Error('Proxy failed');
    const res = {
      writeHead: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    options.on.error(err, {}, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 502,
        error: 'Bad Gateway',
      }),
    );
  });

  it('should execute proxyRes callback without crashing', () => {
    const proxyMockModule = jest.requireMock(
      'http-proxy-middleware',
    ) as unknown as { createProxyMiddleware: jest.Mock };

    middleware.use(createMockReq(), mockRes as Response, mockNext);

    const callArgs = proxyMockModule.createProxyMiddleware.mock
      .calls[0] as unknown[];
    const options = callArgs[0] as MockOptions;
    const proxyRes = { statusCode: 200 };
    const req = { method: 'GET', url: '/api/parametrizacion/test' };

    let threwError = false;
    try {
      options.on.proxyRes(proxyRes, req);
    } catch {
      threwError = true;
    }
    expect(threwError).toBe(false);
  });
});
