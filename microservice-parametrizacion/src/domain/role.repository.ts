import { RoleEntity } from './role.entity';

export interface IRoleRepository {
  findAll(nombre?: string): Promise<RoleEntity[]>;
  findById(id: string): Promise<RoleEntity | null>;
  findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<RoleEntity | null>;
  update(role: RoleEntity): Promise<RoleEntity>;
  countUsersByRoleId(roleId: string): Promise<number>;
}

export const ROLE_REPOSITORY_TOKEN = Symbol('IRoleRepository');
