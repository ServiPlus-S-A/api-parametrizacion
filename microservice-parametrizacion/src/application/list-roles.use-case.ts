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

  async execute(
    dto: ListRolesDto,
  ): Promise<{ content: Array<{ nombre: string; estado: string }> }> {
    const roles = await this.roleRepository.findAll(dto.nombre);

    return {
      content: roles.map((role) => ({
        nombre: role.name,
        estado: role.status,
      })),
    };
  }
}
