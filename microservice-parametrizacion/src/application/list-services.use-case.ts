import { Inject, Injectable } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/service.repository';
import type { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { ListServicesDto } from '../presentation/dto/list-services.dto';

export interface PaginatedServicesResponse {
  content: ServiceEntity[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Paginación obligatoria: tamaño fijo de 10 servicios por página (HU-07).
const PAGE_SIZE = 10;

@Injectable()
export class ListServicesUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(query: ListServicesDto): Promise<PaginatedServicesResponse> {
    const page = query.page ?? 0;

    const { data, total } = await this.serviceRepository.findPaginated({
      name: query.name,
      category: query.category,
      isActive: query.isActive,
      page,
      size: PAGE_SIZE,
    });

    return {
      content: data,
      page,
      size: PAGE_SIZE,
      totalElements: total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }
}
