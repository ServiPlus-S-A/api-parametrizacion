/* eslint-disable @typescript-eslint/unbound-method */
import { ListRolesUseCase } from './list-roles.use-case';
import { IRoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';

const makeRole = (overrides: Partial<RoleEntity> = {}): RoleEntity =>
  new RoleEntity(
    overrides.id ?? 'uuid-1',
    overrides.name ?? 'Admin',
    overrides.description ?? 'Full access',
    overrides.status ?? 'ACTIVO',
    overrides.permissions ?? ['READ_CLIENT'],
    overrides.createdAt ?? new Date(),
    overrides.updatedAt ?? new Date(),
  );

describe('ListRolesUseCase', () => {
  let useCase: ListRolesUseCase;
  let repo: jest.Mocked<IRoleRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNameExcludingId: jest.fn(),
      update: jest.fn(),
      countUsersByRoleId: jest.fn(),
    };
    useCase = new ListRolesUseCase(repo);
  });

  it('should return all roles mapped to Spanish fields', async () => {
    const roles = [makeRole()];
    repo.findAll.mockResolvedValue(roles);

    const result = await useCase.execute({});

    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toEqual({
      nombre: 'Admin',
      estado: 'ACTIVO',
      permisos: ['READ_CLIENT'],
    });
    expect(repo.findAll).toHaveBeenCalledWith(undefined);
  });

  it('should filter by nombre when provided', async () => {
    const roles = [makeRole({ name: 'Coordinador' })];
    repo.findAll.mockResolvedValue(roles);

    const result = await useCase.execute({ nombre: 'Coord' });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].nombre).toBe('Coordinador');
    expect(repo.findAll).toHaveBeenCalledWith('Coord');
  });

  it('should return empty content when no roles match', async () => {
    repo.findAll.mockResolvedValue([]);

    const result = await useCase.execute({ nombre: 'NonExistent' });

    expect(result.content).toHaveLength(0);
  });
});
