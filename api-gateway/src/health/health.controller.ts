import { Controller, Get, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ServiceRegistryService } from '../proxy/service-registry.service';
import { firstValueFrom } from 'rxjs';

interface ServiceHealthStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy';
  responseTimeMs?: number;
  error?: string;
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly registry: ServiceRegistryService,
    private readonly httpService: HttpService,
  ) {}

  @Get()
  getGatewayHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      registeredServices: this.registry.getServiceNames(),
    };
  }

  @Get('services')
  async getServicesHealth() {
    const services = this.registry.getAllServices();
    const healthChecks: ServiceHealthStatus[] = await Promise.all(
      services.map((service) =>
        this.checkServiceHealth(service.name, service.targetUrl),
      ),
    );

    const allHealthy = healthChecks.every((s) => s.status === 'healthy');

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: healthChecks,
    };
  }

  private async checkServiceHealth(
    name: string,
    targetUrl: string,
  ): Promise<ServiceHealthStatus> {
    const healthUrl = `${targetUrl}/health`;
    const start = Date.now();

    try {
      await firstValueFrom(this.httpService.get(healthUrl, { timeout: 5000 }));
      return {
        name,
        url: targetUrl,
        status: 'healthy',
        responseTimeMs: Date.now() - start,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Health check failed for ${name}: ${message}`);
      return {
        name,
        url: targetUrl,
        status: 'unhealthy',
        responseTimeMs: Date.now() - start,
        error: message,
      };
    }
  }
}
