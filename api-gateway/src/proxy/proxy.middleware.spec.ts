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
    registry = new ServiceRegistryService([
      {
        name: 'parametrizacion',
        targetUrl: 'http://microservice:3001',
        requiresAuth: true,
      },
      {
        name: 'catalogo',
        targetUrl: 'http://microservice-catalogo:3002',
        requiresAuth: false,
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

  it('should call next() for non-api paths', () => {
    const req = createMockReq({ path: '/health' });

    middleware.use(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockProxyFn).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when auth required but no header', () => {
    const req = createMockReq({ headers: {} });

    expect(() => {
      middleware.use(req, mockRes as Response, mockNext);
    }).toThrow(UnauthorizedException);
  });

  it('should allow unauthenticated access to services with requiresAuth=false', () => {
    const req = createMockReq({ path: '/api/catalogo/products', headers: {} });

    middleware.use(req, mockRes as Response, mockNext);

    expect(mockProxyFn).toHaveBeenCalled();
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
