import { Inject, Injectable, Logger } from '@nestjs/common';
import servicesConfig, {
  ServiceDefinition,
} from '../config/services.config';

@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private readonly servicesMap: Map<string, ServiceDefinition>;

  constructor(
    @Inject(servicesConfig.KEY)
    private readonly services: ServiceDefinition[],
  ) {
    this.servicesMap = new Map(services.map((s) => [s.name, s]));
    this.logger.log(
      `Registered ${this.servicesMap.size} service(s): ${[...this.servicesMap.keys()].join(', ')}`,
    );
  }

  getService(name: string): ServiceDefinition | undefined {
    return this.servicesMap.get(name.toLowerCase());
  }

  getAllServices(): ServiceDefinition[] {
    return [...this.servicesMap.values()];
  }

  getServiceNames(): string[] {
    return [...this.servicesMap.keys()];
  }

  hasService(name: string): boolean {
    return this.servicesMap.has(name.toLowerCase());
  }
}
