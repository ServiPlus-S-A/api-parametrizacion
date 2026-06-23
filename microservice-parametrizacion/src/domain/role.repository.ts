import { RoleEntity } from './role.entity';

export interface IRoleRepository {
  findAll(nombre?: string): Promise<RoleEntity[]>;
}

export const ROLE_REPOSITORY_TOKEN = Symbol('IRoleRepository');
