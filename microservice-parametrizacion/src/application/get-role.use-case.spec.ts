/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { GetRoleUseCase } from './get-role.use-case';
import { IRoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';

const makeRole = (overrides: Partial<RoleEntity> = {}): RoleEntity =>
  new RoleEntity(
    overrides.id ?? 'role-uuid',
    overrides.name ?? 'Admin',
    overrides.description ?? 'Full access',
    overrides.status ?? 'ACTIVO',
    overrides.permissions ?? ['READ_CLIENT'],
    overrides.createdAt ?? new Date('2026-01-01'),
    overrides.updatedAt ?? new Date('2026-06-01'),
  );

describe('GetRoleUseCase', () => {
  let useCase: GetRoleUseCase;
  let repo: jest.Mocked<IRoleRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNameExcludingId: jest.fn(),
      update: jest.fn(),
      countUsersByRoleId: jest.fn(),
    };
    useCase = new GetRoleUseCase(repo);
  });

  it('should return role detail when found', async () => {
    repo.findById.mockResolvedValue(makeRole());

    const result = await useCase.execute('role-uuid');

    expect(repo.findById).toHaveBeenCalledWith('role-uuid');
    expect(result).toEqual({
      id: 'role-uuid',
      nombre: 'Admin',
      descripcion: 'Full access',
      estado: 'ACTIVO',
      permisos: ['READ_CLIENT'],
      creadoEn: new Date('2026-01-01').toISOString(),
      actualizadoEn: new Date('2026-06-01').toISOString(),
    });
  });

  it('should throw NotFoundException when role does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
