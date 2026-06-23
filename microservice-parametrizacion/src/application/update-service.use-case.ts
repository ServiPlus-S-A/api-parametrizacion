import {
  Inject,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { SERVICE_REPOSITORY_TOKEN } from '../domain/service.repository';
import type { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { UpdateServiceDto } from '../presentation/dto/update-service.dto';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICE_REPOSITORY_TOKEN)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(id: string, dto: UpdateServiceDto): Promise<ServiceEntity> {
    // Verificar que el servicio existe
    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`No se encontró el servicio con ID ${id}`);
    }

    // Si se cambia el nombre, verificar que no esté ya tomado por otro servicio
    if (dto.name !== undefined && dto.name !== existing.name) {
      const nameConflict = await this.serviceRepository.findByName(dto.name);
      if (nameConflict) {
        throw new ConflictException(
          `Ya existe un servicio con el nombre "${dto.name}"`,
        );
      }
    }

    // Combinar datos actuales con los nuevos del DTO (partial update)
    const updated = new ServiceEntity(
      existing.id,
      dto.name ?? existing.name,
      dto.basePrice ?? existing.basePrice,
      dto.isActive ?? existing.isActive,
      dto.category ?? existing.category,
      dto.unit ?? existing.unit,
    );

    return await this.serviceRepository.update(updated);
  }
}
