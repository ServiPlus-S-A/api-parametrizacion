/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientRepositoryImpl } from './client.repository.impl';
import { ClientOrmEntity } from './client.orm-entity';
import { UserOrmEntity } from './user.orm-entity';
import { ClientEntity } from '../domain/client.entity';

describe('ClientRepositoryImpl', () => {
  let repository: ClientRepositoryImpl;
  let clientOrmRepo: Repository<ClientOrmEntity>;
  let userOrmRepo: Repository<UserOrmEntity>;

  const mockClientOrmEntity = {
    id: 'client-uuid',
    fullName: 'Client Name',
    taxId: '900123456-7',
    clientType: 'Empresarial',
    city: 'Bogota',
    email: 'client@email.com',
    status: 'Active',
    user: { id: 'user-uuid' },
    createdBy: { id: 'creator-uuid' },
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ClientOrmEntity;

  const mockClientEntity = new ClientEntity(
    'client-uuid',
    'Client Name',
    '900123456-7',
    'Empresarial',
    'Bogota',
    'client@email.com',
    'Active',
    'creator-uuid',
    'user-uuid',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientRepositoryImpl,
        {
          provide: getRepositoryToken(ClientOrmEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockClientOrmEntity),
            save: jest.fn().mockResolvedValue(mockClientOrmEntity),
            findOne: jest.fn().mockResolvedValue(mockClientOrmEntity),
          },
        },
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            count: jest.fn().mockResolvedValue(1),
          },
        },
      ],
    }).compile();

    repository = module.get<ClientRepositoryImpl>(ClientRepositoryImpl);
    clientOrmRepo = module.get<Repository<ClientOrmEntity>>(
      getRepositoryToken(ClientOrmEntity),
    );
    userOrmRepo = module.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should create and save a ClientOrmEntity and return ClientEntity', async () => {
      const result = await repository.save(mockClientEntity);

      expect(clientOrmRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'client-uuid',
          fullName: 'Client Name',
          taxId: '900123456-7',
          clientType: 'Empresarial',
          city: 'Bogota',
          email: 'client@email.com',
        }),
      );
      expect(clientOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ClientEntity);
      expect(result.id).toBe('client-uuid');
    });
  });

  describe('findById', () => {
    it('should return ClientEntity when found', async () => {
      const result = await repository.findById('client-uuid');

      expect(clientOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'client-uuid' },
        relations: ['createdBy', 'user'],
      });
      expect(result).toBeInstanceOf(ClientEntity);
      expect(result?.id).toBe('client-uuid');
    });

    it('should return null when not found', async () => {
      jest.spyOn(clientOrmRepo, 'findOne').mockResolvedValueOnce(null);
      const result = await repository.findById('missing-uuid');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return ClientEntity when found by email', async () => {
      const result = await repository.findByEmail('client@email.com');

      expect(clientOrmRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'client@email.com' },
        relations: ['createdBy', 'user'],
      });
      expect(result).toBeInstanceOf(ClientEntity);
      expect(result?.email).toBe('client@email.com');
    });

    it('should return null when not found', async () => {
      jest.spyOn(clientOrmRepo, 'findOne').mockResolvedValueOnce(null);
      const result = await repository.findByEmail('missing@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findByTaxId', () => {
    it('should return ClientEntity when found by taxId', async () => {
      const result = await repository.findByTaxId('900123456-7');

      expect(clientOrmRepo.findOne).toHaveBeenCalledWith({
        where: { taxId: '900123456-7' },
        relations: ['createdBy', 'user'],
      });
      expect(result).toBeInstanceOf(ClientEntity);
      expect(result?.taxId).toBe('900123456-7');
    });

    it('should return null when not found', async () => {
      jest.spyOn(clientOrmRepo, 'findOne').mockResolvedValueOnce(null);
      const result = await repository.findByTaxId('missing-taxid');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return ClientEntity when found by user id', async () => {
      const result = await repository.findByUserId('user-uuid');

      expect(clientOrmRepo.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-uuid' } },
        relations: ['createdBy', 'user'],
      });
      expect(result).toBeInstanceOf(ClientEntity);
      expect(result?.userId).toBe('user-uuid');
    });

    it('should return null when not found', async () => {
      jest.spyOn(clientOrmRepo, 'findOne').mockResolvedValueOnce(null);
      const result = await repository.findByUserId('missing-user-uuid');

      expect(result).toBeNull();
    });
  });

  describe('userExists', () => {
    it('should return false if the userId is not a valid UUID', async () => {
      const result = await repository.userExists('invalid-uuid');

      expect(result).toBe(false);
      expect(userOrmRepo.count).not.toHaveBeenCalled();
    });

    it('should return true if the user exists', async () => {
      const validUuid = 'd8376c24-5dbf-474e-c8e3-90c58e5a1b2c';
      const result = await repository.userExists(validUuid);

      expect(userOrmRepo.count).toHaveBeenCalledWith({
        where: { id: validUuid },
      });
      expect(result).toBe(true);
    });

    it('should return false if the user does not exist', async () => {
      jest.spyOn(userOrmRepo, 'count').mockResolvedValueOnce(0);
      const validUuid = 'd8376c24-5dbf-474e-c8e3-90c58e5a1b2c';
      const result = await repository.userExists(validUuid);

      expect(result).toBe(false);
    });
  });
});
