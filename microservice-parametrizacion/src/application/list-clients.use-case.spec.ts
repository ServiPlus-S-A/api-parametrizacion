/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { ListClientsUseCase } from './list-clients.use-case';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';

const makeClient = (overrides: Partial<ClientEntity> = {}): ClientEntity =>
  new ClientEntity(
    overrides.id ?? 'uuid-1',
    overrides.fullName ?? 'Empresa ABC',
    overrides.taxId ?? '900111222-1',
    overrides.clientType ?? 'Empresa',
    overrides.city ?? 'Bogotá',
    overrides.email ?? 'abc@empresa.co',
    overrides.status ?? 'Active',
    overrides.createdById ?? 'admin-uuid',
    overrides.userId ?? 'user-uuid',
  );

describe('ListClientsUseCase', () => {
  let useCase: ListClientsUseCase;
  let repo: jest.Mocked<IClientRepository>;

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
    useCase = new ListClientsUseCase(repo);
  });

  it('should return paginated clients with all filters', async () => {
    const clients = [makeClient()];
    repo.findAndPaginate.mockResolvedValue({ content: clients, totalPages: 1 });

    const result = await useCase.execute({
      fullName: 'Empresa',
      taxId: '900111222-1',
      city: 'Bogotá',
      status: 'Active',
      page: 0,
    });

    expect(result.content).toHaveLength(1);
    expect(result.totalPages).toBe(1);
    expect(repo.findAndPaginate).toHaveBeenCalledWith({
      fullName: 'Empresa',
      taxId: '900111222-1',
      city: 'Bogotá',
      status: 'Active',
      page: 0,
    });
  });

  it('should throw BadRequestException when page is negative', async () => {
    await expect(useCase.execute({ page: -1 })).rejects.toThrow(
      BadRequestException,
    );
    expect(repo.findAndPaginate).not.toHaveBeenCalled();
  });

  it('should NOT do partial match on taxId — passes exact value to repo', async () => {
    repo.findAndPaginate.mockResolvedValue({ content: [], totalPages: 1 });

    await useCase.execute({ taxId: '900111222-1', page: 0 });

    // The use case must pass the taxId as-is; the exact-match is the repo's responsibility
    expect(repo.findAndPaginate).toHaveBeenCalledWith(
      expect.objectContaining({ taxId: '900111222-1' }),
    );
  });

  it('should default page to 0 when not provided', async () => {
    repo.findAndPaginate.mockResolvedValue({ content: [], totalPages: 1 });

    await useCase.execute({ page: 0 });

    expect(repo.findAndPaginate).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0 }),
    );
  });
});
