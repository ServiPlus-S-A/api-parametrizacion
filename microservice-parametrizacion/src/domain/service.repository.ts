import { ServiceEntity } from './service.entity';

export interface ServiceListFilters {
  name?: string;
  category?: string;
  isActive?: boolean;
  page: number;
  size: number;
}

export interface PaginatedServices {
  data: ServiceEntity[];
  total: number;
}

export interface IServiceRepository {
  save(service: ServiceEntity): Promise<ServiceEntity>;
  update(service: ServiceEntity): Promise<ServiceEntity>;
  findById(id: string): Promise<ServiceEntity | null>;
  findByName(name: string): Promise<ServiceEntity | null>;
  findPaginated(filters: ServiceListFilters): Promise<PaginatedServices>;
}

export const SERVICE_REPOSITORY_TOKEN = Symbol('IServiceRepository');
