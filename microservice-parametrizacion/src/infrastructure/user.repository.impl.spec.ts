import { Test, TestingModule } from '@nestjs/testing';
import { UserRepositoryImpl } from './user.repository.impl';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { RoleOrmEntity } from './role.orm-entity';
import { UserEntity } from '../domain/user.entity';
import { Repository } from 'typeorm';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;
  let typeOrmRepository: jest.Mocked<Repository<UserOrmEntity>>;
  let mockOrm: UserOrmEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryImpl,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
    typeOrmRepository = module.get(getRepositoryToken(UserOrmEntity));

    mockOrm = new UserOrmEntity();
    mockOrm.id = 'uuid-123';
    mockOrm.fullName = 'Test User';
    mockOrm.email = 'test@example.com';
    mockOrm.password = 'hashed';
    mockOrm.status = 'Active';
    mockOrm.role = { id: 'role-1' } as RoleOrmEntity;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return a domain entity if found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockOrm);

      const result = await repository.findById('uuid-123');
      expect(result).toBeInstanceOf(UserEntity);
      expect(result!.id).toBe('uuid-123');
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        relations: ['role'],
      });
    });

    it('should return null if not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('uuid-999');
      expect(result).toBeNull();
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-999' },
        relations: ['role'],
      });
    });
  });

  describe('save', () => {
    it('should save and return a domain entity', async () => {
      const domainUser = new UserEntity(
        'uuid-123',
        'Test User',
        'test@example.com',
        'hashed',
        'Active',
        'role-1',
      );

      typeOrmRepository.create.mockReturnValue(mockOrm);
      typeOrmRepository.save.mockResolvedValue(mockOrm);

      const result = await repository.save(domainUser);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('uuid-123');
    });
  });

  describe('findByEmail', () => {
    it('should return a domain entity if found by email', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockOrm);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(UserEntity);
      expect(result?.email).toBe('test@example.com');
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['role'],
      });
    });

    it('should return null if email is not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail('missing@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should query without filters when none are provided', async () => {
      typeOrmRepository.findAndCount.mockResolvedValue([[mockOrm], 1]);

      const result = await repository.findAll({
        page: 0,
        size: 10,
      });

      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['role'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result.totalPages).toBe(1);
      expect(result.content[0]).toBeInstanceOf(UserEntity);
    });

    it('should query by q and estado using OR conditions', async () => {
      typeOrmRepository.findAndCount.mockResolvedValue([[mockOrm], 1]);

      await repository.findAll({
        q: 'test',
        estado: 'Active',
        page: 1,
        size: 5,
      });

      const findAndCountCall = typeOrmRepository.findAndCount.mock
        .calls[0]?.[0] as {
        where: unknown[];
        skip: number;
        take: number;
      };
      expect(findAndCountCall.where).toHaveLength(2);
      expect(findAndCountCall.skip).toBe(5);
      expect(findAndCountCall.take).toBe(5);
    });

    it('should query only by estado when q is not provided', async () => {
      typeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.findAll({
        estado: 'INACTIVO',
        page: 0,
        size: 10,
      });

      expect(typeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: [{ status: 'INACTIVO' }],
        relations: ['role'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });
  });

  describe('update', () => {
    it('should throw if user does not exist', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      await expect(
        repository.update('missing-id', { nombre: 'Nuevo nombre' }),
      ).rejects.toThrow('User with id missing-id not found');
    });

    it('should update only provided fields and return domain entity', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockOrm);
      typeOrmRepository.save.mockResolvedValue({
        ...mockOrm,
        fullName: 'Updated User',
        status: 'INACTIVO',
        password: 'new-hash',
        role: { id: 'role-2' } as RoleOrmEntity,
      });

      const result: UserEntity = await repository.update('uuid-123', {
        nombre: 'Updated User',
        estado: 'INACTIVO',
        clave: 'new-hash',
        rolId: 'role-2',
      });

      expect(typeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Updated User',
          status: 'INACTIVO',
          password: 'new-hash',
          role: { id: 'role-2' },
        }),
      );
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.nombre).toBe('Updated User');
      expect(result.rolId).toBe('role-2');
    });
  });
});
