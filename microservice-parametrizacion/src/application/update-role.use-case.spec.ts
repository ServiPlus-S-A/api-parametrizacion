/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateRoleUseCase } from './update-role.use-case';
import { IRoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';
import { AuditLogger } from '../transversal/audit.logger';

const makeRole = (overrides: Partial<RoleEntity> = {}): RoleEntity =>
  new RoleEntity(
    overrides.id ?? 'role-uuid',
    overrides.name ?? 'Admin',
    overrides.description ?? 'Full access',
    overrides.status ?? 'ACTIVO',
    overrides.permissions ?? ['READ_CLIENT'],
    overrides.createdAt ?? new Date('2026-01-01'),
    overrides.updatedAt ?? new Date('2026-01-01'),
  );

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;
  let repo: jest.Mocked<IRoleRepository>;
  let auditLogger: jest.Mocked<AuditLogger>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByNameExcludingId: jest.fn(),
      update: jest.fn(),
      countUsersByRoleId: jest.fn(),
    };
    auditLogger = {
      logAction: jest.fn(),
    } as unknown as jest.Mocked<AuditLogger>;
    useCase = new UpdateRoleUseCase(repo, auditLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException when role does not exist (404)', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent', { descripcion: 'test' }),
    ).rejects.toThrow(NotFoundException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when new nombre belongs to another role (409)', async () => {
    repo.findById.mockResolvedValue(makeRole());
    repo.findByNameExcludingId.mockResolvedValue(
      makeRole({ id: 'other-uuid', name: 'Coord' }),
    );

    await expect(
      useCase.execute('role-uuid', { nombre: 'Coord' }),
    ).rejects.toThrow(ConflictException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should not check name conflict when nombre is not being changed', async () => {
    repo.findById.mockResolvedValue(makeRole());
    repo.update.mockImplementation((r) => Promise.resolve(r));

    await useCase.execute('role-uuid', { descripcion: 'New desc' });

    expect(repo.findByNameExcludingId).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should not check name conflict when nombre is the same as existing', async () => {
    repo.findById.mockResolvedValue(makeRole({ name: 'Admin' }));
    repo.update.mockImplementation((r) => Promise.resolve(r));

    await useCase.execute('role-uuid', { nombre: 'Admin' });

    expect(repo.findByNameExcludingId).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException when deactivating with active users and no confirmar (409)', async () => {
    repo.findById.mockResolvedValue(makeRole({ status: 'ACTIVO' }));
    repo.countUsersByRoleId.mockResolvedValue(3);

    await expect(
      useCase.execute('role-uuid', { estado: 'INACTIVO' }),
    ).rejects.toThrow(ConflictException);

    expect(repo.update).not.toHaveBeenCalled();
  });

  it('should allow deactivation with active users when confirmar is true', async () => {
    repo.findById.mockResolvedValue(makeRole({ status: 'ACTIVO' }));
    repo.countUsersByRoleId.mockResolvedValue(3);
    repo.update.mockImplementation((r) => Promise.resolve(r));

    const result = await useCase.execute('role-uuid', {
      estado: 'INACTIVO',
      confirmar: true,
    });

    expect(repo.countUsersByRoleId).not.toHaveBeenCalled();
    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result).toHaveProperty('id', 'role-uuid');
    expect(result).toHaveProperty('actualizadoAt');
  });

  it('should update all fields successfully when no conflicts', async () => {
    const existing = makeRole();
    repo.findById.mockResolvedValue(existing);
    repo.update.mockImplementation((r) => Promise.resolve(r));

    const result = await useCase.execute('role-uuid', {
      nombre: 'Supervisor',
      descripcion: 'New description',
      estado: 'INACTIVO',
    });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('role-uuid');
    expect(result.actualizadoAt).toBeDefined();
  });

  it('should log audit action on successful update', async () => {
    repo.findById.mockResolvedValue(makeRole());
    repo.update.mockImplementation((r) => Promise.resolve(r));

    await useCase.execute('role-uuid', { descripcion: 'Updated' });

    expect(auditLogger.logAction).toHaveBeenCalledWith(
      expect.any(String),
      'UPDATE_ROLE',
      'role-uuid',
    );
  });
});
