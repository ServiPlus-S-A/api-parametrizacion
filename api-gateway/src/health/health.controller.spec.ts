import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { HealthController } from './health.controller';
import { ServiceRegistryService } from '../proxy/service-registry.service';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';

describe('HealthController', () => {
  let controller: HealthController;
  let httpService: HttpService;
  let registry: ServiceRegistryService;

  beforeEach(async () => {
    registry = new ServiceRegistryService([
      {
        name: 'parametrizacion',
        targetUrl: 'http://microservice:3001',
        requiresAuth: true,
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ServiceRegistryService,
          useValue: registry,
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('getGatewayHealth', () => {
    it('should return gateway health status', () => {
      const result = controller.getGatewayHealth();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('api-gateway');
      expect(result.registeredServices).toEqual(['parametrizacion']);
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeDefined();
    });
  });

  describe('getServicesHealth', () => {
    it('should return healthy when all services respond', async () => {
      const mockResponse: AxiosResponse = {
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: new AxiosHeaders(),
        } as InternalAxiosRequestConfig,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse));

      const result = await controller.getServicesHealth();
      expect(result.status).toBe('ok');
      expect(result.services).toHaveLength(1);
      expect(result.services[0].status).toBe('healthy');
      expect(result.services[0].name).toBe('parametrizacion');
    });

    it('should return degraded when a service is down', async () => {
      jest
        .spyOn(httpService, 'get')
        .mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

      const result = await controller.getServicesHealth();
      expect(result.status).toBe('degraded');
      expect(result.services[0].status).toBe('unhealthy');
      expect(result.services[0].error).toContain('ECONNREFUSED');
    });
  });
});
