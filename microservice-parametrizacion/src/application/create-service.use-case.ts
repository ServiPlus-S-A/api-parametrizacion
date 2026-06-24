import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/service.repository';
import type { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { CreateServiceDto } from '../presentation/dto/create-service.dto';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(dto: CreateServiceDto): Promise<ServiceEntity> {
    const existing = await this.serviceRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(
        `Service with name ${dto.name} already exists`,
      );
    }

    const newService = new ServiceEntity(
      randomUUID(),
      dto.name,
      dto.basePrice,
      true,
      dto.category,
      dto.unit,
    );
    return await this.serviceRepository.save(newService);
  }
}
