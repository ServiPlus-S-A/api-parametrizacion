import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  createProxyMiddleware,
  type RequestHandler,
} from 'http-proxy-middleware';
import { ServiceRegistryService } from './service-registry.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);
  private readonly proxyCache = new Map<string, RequestHandler>();
  private readonly jwtGuard = new JwtAuthGuard();
  private readonly swaggerUiPath = '/api/docs';
  private readonly swaggerJsonPath = '/api/docs-json';

  constructor(private readonly registry: ServiceRegistryService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestPath = req.originalUrl || req.path || '';

    if (this.shouldRedirectSwaggerUi(requestPath)) {
      res.redirect(301, `${this.swaggerUiPath}/`);
      return;
    }

    const serviceName = this.extractServiceName(requestPath);

    if (!serviceName) {
      next();
      return;
    }

    const service = this.registry.getService(serviceName);

    if (!service) {
      throw new NotFoundException(
        `Service "${serviceName}" is not registered. Available: ${this.registry.getServiceNames().join(', ')}`,
      );
    }

    if (service.requiresAuth) {
      const hasAuth = req.headers.authorization;
      if (!hasAuth) {
        throw new UnauthorizedException(
          `Service "${serviceName}" requires authentication`,
        );
      }
      // Delegate to JwtAuthGuard for full validation when implemented
    }

    const proxy = this.getOrCreateProxy(service.name, service.targetUrl);

    this.logger.debug(
      `Proxying ${req.method} ${req.originalUrl} → ${service.targetUrl}`,
    );

    void proxy(req, res, next);
  }

  private extractServiceName(path: string): string | null {
    const pathname = path.split('?')[0];

    if (
      pathname === this.swaggerJsonPath ||
      pathname === this.swaggerUiPath ||
      pathname === `${this.swaggerUiPath}/` ||
      pathname.startsWith(`${this.swaggerUiPath}/`)
    ) {
      return 'docs';
    }

    // Path format: /api/{serviceName}/... or /api/v1/{serviceName}/...
    const match = pathname.match(/^\/api\/(?:v\d+\/)?([^/]+)/);
    return match ? match[1].toLowerCase() : null;
  }

  private shouldRedirectSwaggerUi(path: string): boolean {
    return path.split('?')[0] === this.swaggerUiPath;
  }

  private getOrCreateProxy(
    serviceName: string,
    targetUrl: string,
  ): RequestHandler {
    if (!this.proxyCache.has(serviceName)) {
      const proxy = createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: (path) => {
          if (serviceName === 'docs') {
            return path;
          }

          return path.replace(
            new RegExp(`^/api/(?:v\\d+/)?${serviceName}`),
            '',
          );
        },
        on: {
          proxyReq: (proxyReq, req) => {
            const requestId =
              req.headers['x-request-id'] || this.generateRequestId();
            proxyReq.setHeader('X-Request-Id', requestId);
            proxyReq.setHeader('X-Forwarded-Host', req.headers.host || '');
            proxyReq.setHeader('X-Gateway-Service', serviceName);
          },
          proxyRes: (proxyRes, req) => {
            this.logger.debug(
              `← ${proxyRes.statusCode} ${req.method} ${req.url} [${serviceName}]`,
            );
          },
          error: (err, req, res) => {
            this.logger.error(`Proxy error for ${serviceName}: ${err.message}`);
            if (res && 'writeHead' in res) {
              const httpRes = res as Response;
              httpRes.status(502).json({
                statusCode: 502,
                message: `Service "${serviceName}" is unavailable`,
                error: 'Bad Gateway',
                timestamp: new Date().toISOString(),
              });
            }
          },
        },
      });

      this.proxyCache.set(serviceName, proxy);
    }

    return this.proxyCache.get(serviceName)!;
  }

  private generateRequestId(): string {
    return `gw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
