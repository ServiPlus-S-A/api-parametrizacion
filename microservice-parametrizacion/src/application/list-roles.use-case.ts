import { Inject, Injectable } from '@nestjs/common';
import { ROLE_REPOSITORY_TOKEN } from '../domain/role.repository';
import type { IRoleRepository } from '../domain/role.repository';
import { ListRolesDto } from '../presentation/dto/list-roles.dto';

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY_TOKEN)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(dto: ListRolesDto): Promise<{
    content: Array<{
      id: string;
      nombre: string;
      estado: string;
      permisos: string[];
    }>;
  }> {
    const roles = await this.roleRepository.findAll(dto.nombre);

    return {
      content: roles.map((role) => ({
        id: role.id,
        nombre: role.name,
        estado: role.status,
        permisos: role.permissions,
      })),
    };
  }
}
