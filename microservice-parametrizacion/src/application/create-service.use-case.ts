import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/service.repository';
import type { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { CreateServiceDto } from '../presentation/dto/create-service.dto';
// import { v4 as uuidv4 } from 'uuid';

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

    // In a real app we would use uuidv4(). Using static for archetype.
    const newService = new ServiceEntity(
      '123e4567-e89b-12d3-a456-426614174000',
      dto.name,
      dto.basePrice,
      true,
    );
    return await this.serviceRepository.save(newService);
  }
}
