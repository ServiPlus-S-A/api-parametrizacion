import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY_TOKEN } from '../domain/role.repository';
import type { IRoleRepository } from '../domain/role.repository';

@Injectable()
export class GetRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(id: string): Promise<{
    id: string;
    nombre: string;
    descripcion: string | null;
    estado: string;
    permisos: string[];
    creadoEn: string;
    actualizadoEn: string;
  }> {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new NotFoundException(`No se encontró el rol con ID ${id}`);
    }

    return {
      id: role.id,
      nombre: role.name,
      descripcion: role.description,
      estado: role.status,
      permisos: role.permissions,
      creadoEn: role.createdAt.toISOString(),
      actualizadoEn: role.updatedAt.toISOString(),
    };
  }
}
