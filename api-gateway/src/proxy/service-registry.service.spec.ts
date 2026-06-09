import { ServiceRegistryService } from './service-registry.service';
import { ServiceDefinition } from '../config/services.config';

describe('ServiceRegistryService', () => {
  const mockServices: ServiceDefinition[] = [
    {
      name: 'parametrizacion',
      targetUrl: 'http://microservice:3001',
      requiresAuth: true,
    },
    {
      name: 'facturacion',
      targetUrl: 'http://microservice-facturacion:3002',
      requiresAuth: false,
    },
  ];

  let registry: ServiceRegistryService;

  beforeEach(() => {
    registry = new ServiceRegistryService(mockServices);
  });

  describe('getService', () => {
    it('should return a service by name', () => {
      const service = registry.getService('parametrizacion');
      expect(service).toEqual(mockServices[0]);
    });

    it('should return a service regardless of case', () => {
      const service = registry.getService('PARAMETRIZACION');
      expect(service).toEqual(mockServices[0]);
    });

    it('should return undefined for unknown service', () => {
      const service = registry.getService('unknown');
      expect(service).toBeUndefined();
    });
  });

  describe('getAllServices', () => {
    it('should return all registered services', () => {
      const services = registry.getAllServices();
      expect(services).toHaveLength(2);
      expect(services).toEqual(mockServices);
    });
  });

  describe('getServiceNames', () => {
    it('should return all service names', () => {
      const names = registry.getServiceNames();
      expect(names).toEqual(['parametrizacion', 'facturacion']);
    });
  });

  describe('hasService', () => {
    it('should return true for registered service', () => {
      expect(registry.hasService('parametrizacion')).toBe(true);
    });

    it('should return false for unknown service', () => {
      expect(registry.hasService('unknown')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(registry.hasService('FACTURACION')).toBe(true);
    });
  });

  describe('empty registry', () => {
    it('should handle empty services array', () => {
      const emptyRegistry = new ServiceRegistryService([]);
      expect(emptyRegistry.getAllServices()).toEqual([]);
      expect(emptyRegistry.getServiceNames()).toEqual([]);
      expect(emptyRegistry.hasService('any')).toBe(false);
    });
  });
});
