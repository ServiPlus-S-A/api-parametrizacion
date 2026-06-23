/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ChangeClientStatusUseCase } from './change-client-status.use-case';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { AuditLogger } from '../transversal/audit.logger';
import { ChangeClientStatusDto } from '../presentation/dto/change-client-status.dto';

const makeClient = (status: 'Active' | 'Inactive' = 'Active'): ClientEntity =>
  new ClientEntity(
    'uuid-101',
    'Cliente Test SA',
    '800999111-2',
    'Empresa',
    'Medellín',
    'test@empresa.co',
    status,
    'admin-uuid',
    'user-uuid',
  );

describe('ChangeClientStatusUseCase', () => {
  let useCase: ChangeClientStatusUseCase;
  let repo: jest.Mocked<IClientRepository>;
  let auditLogger: jest.Mocked<AuditLogger>;

  beforeEach(() => {
    repo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByTaxId: jest.fn(),
      findByUserId: jest.fn(),
      userExists: jest.fn(),
      findAndPaginate: jest.fn(),
      save: jest.fn(),
      hasActiveSolicitudes: jest.fn(),
      saveStatusHistory: jest.fn(),
    };
    auditLogger = {
      logAction: jest.fn(),
    } as unknown as jest.Mocked<AuditLogger>;
    useCase = new ChangeClientStatusUseCase(repo, auditLogger);
  });

  it('should throw NotFoundException when client does not exist (404)', async () => {
    repo.findById.mockResolvedValue(null);

    const dto: ChangeClientStatusDto = { status: 'Inactive', motivo: 'Mora' };

    await expect(useCase.execute('non-existent', dto)).rejects.toThrow(
      NotFoundException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when client has active solicitudes (409)', async () => {
    repo.findById.mockResolvedValue(makeClient('Active'));
    repo.hasActiveSolicitudes.mockResolvedValue(true);

    const dto: ChangeClientStatusDto = { status: 'Inactive', motivo: 'Mora' };

    await expect(useCase.execute('uuid-101', dto)).rejects.toThrow(
      ConflictException,
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should deactivate client, save history, and log audit when moving to Inactive', async () => {
    repo.findById.mockResolvedValue(makeClient('Active'));
    repo.hasActiveSolicitudes.mockResolvedValue(false);
    repo.save.mockImplementation((c) => Promise.resolve(c));
    repo.saveStatusHistory.mockResolvedValue();

    const dto: ChangeClientStatusDto = { status: 'Inactive', motivo: 'Mora' };

    const result = await useCase.execute('uuid-101', dto, 'admin-user');

    expect(result).toEqual({
      id: 'uuid-101',
      status: 'Inactive',
      mensaje: 'Ok',
    });
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.saveStatusHistory).toHaveBeenCalledWith(
      'uuid-101',
      'Active',
      'Inactive',
      'Mora',
      'admin-user',
    );
    // audit log called at least once (CHANGE_STATUS + CLOSE_SESSION_STUB)
    expect(auditLogger.logAction).toHaveBeenCalled();
  });

  it('should activate client without saving history', async () => {
    repo.findById.mockResolvedValue(makeClient('Inactive'));
    repo.save.mockImplementation((c) => Promise.resolve(c));

    const dto: ChangeClientStatusDto = {
      status: 'Active',
      motivo: 'Reactivation',
    };

    const result = await useCase.execute('uuid-101', dto, 'admin-user');

    expect(result.status).toBe('Active');
    expect(result.mensaje).toBe('Ok');
    // History only saved when deactivating
    expect(repo.saveStatusHistory).not.toHaveBeenCalled();
  });

  it('should return Ok idempotently when status is already the requested one', async () => {
    repo.findById.mockResolvedValue(makeClient('Active'));

    const dto: ChangeClientStatusDto = {
      status: 'Active',
      motivo: 'No change',
    };

    const result = await useCase.execute('uuid-101', dto);

    expect(result.status).toBe('Active');
    expect(result.mensaje).toBe('Ok');
    expect(repo.save).not.toHaveBeenCalled();
  });
});
