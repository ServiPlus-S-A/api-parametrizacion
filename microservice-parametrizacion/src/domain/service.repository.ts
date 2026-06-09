import { ServiceEntity } from './service.entity';

export interface IServiceRepository {
  save(service: ServiceEntity): Promise<ServiceEntity>;
  findById(id: string): Promise<ServiceEntity | null>;
  findByName(name: string): Promise<ServiceEntity | null>;
}

export const SERVICE_REPOSITORY_TOKEN = Symbol('IServiceRepository');
