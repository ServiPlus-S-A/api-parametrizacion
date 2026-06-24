import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ROLE_REPOSITORY_TOKEN } from '../domain/role.repository';
import type { IRoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';
import { UpdateRoleDto } from '../presentation/dto/update-role.dto';
import { AuditLogger } from '../transversal/audit.logger';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
    private readonly auditLogger: AuditLogger,
  ) {}

  async execute(
    id: string,
    dto: UpdateRoleDto,
  ): Promise<{ id: string; actualizadoAt: string }> {
    const existing = await this.roleRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`No se encontró el rol con ID ${id}`);
    }

    if (dto.nombre !== undefined && dto.nombre !== existing.name) {
      const conflict = await this.roleRepository.findByNameExcludingId(
        dto.nombre,
        id,
      );
      if (conflict) {
        throw new ConflictException('El rol ya se encuentra registrado');
      }
    }

    if (
      dto.estado !== undefined &&
      dto.estado !== existing.status &&
      dto.estado === 'INACTIVO' &&
      !dto.confirmar
    ) {
      const userCount = await this.roleRepository.countUsersByRoleId(id);
      if (userCount > 0) {
        throw new ConflictException('Este rol tiene usuarios asociados');
      }
    }

    const updated = new RoleEntity(
      existing.id,
      dto.nombre ?? existing.name,
      dto.descripcion ?? existing.description,
      dto.estado ?? existing.status,
      existing.permissions,
      existing.createdAt,
      new Date(),
    );

    const saved = await this.roleRepository.update(updated);

    this.auditLogger.logAction('system', 'UPDATE_ROLE', id);

    return { id: saved.id, actualizadoAt: saved.updatedAt.toISOString() };
  }
}
