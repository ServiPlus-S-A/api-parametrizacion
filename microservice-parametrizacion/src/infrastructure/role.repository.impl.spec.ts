/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepositoryImpl } from './role.repository.impl';
import { RoleOrmEntity } from './role.orm-entity';
import { UserOrmEntity } from './user.orm-entity';
import { RoleEntity } from '../domain/role.entity';

describe('RoleRepositoryImpl', () => {
  let repository: RoleRepositoryImpl;
  let roleOrmRepo: Repository<RoleOrmEntity>;
  let userOrmRepo: Repository<UserOrmEntity>;

  const mockOrmEntity: RoleOrmEntity = {
    id: 'role-uuid',
    name: 'Admin',
    description: 'Full access',
    status: 'ACTIVO',
    permissions: ['READ_CLIENT', 'WRITE_CLIENT'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockQueryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockOrmEntity]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleRepositoryImpl,
        {
          provide: getRepositoryToken(RoleOrmEntity),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            findOne: jest.fn().mockResolvedValue(mockOrmEntity),
            create: jest.fn().mockReturnValue(mockOrmEntity),
            save: jest.fn().mockResolvedValue(mockOrmEntity),
          },
        },
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            count: jest.fn().mockResolvedValue(0),
          },
        },
      ],
    }).compile();

    repository = module.get<RoleRepositoryImpl>(RoleRepositoryImpl);
    roleOrmRepo = module.get<Repository<RoleOrmEntity>>(
      getRepositoryToken(RoleOrmEntity),
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

  describe('findAll', () => {
    it('should return all roles when no filter is provided', async () => {
      const result = await repository.findAll();

      expect(roleOrmRepo.createQueryBuilder).toHaveBeenCalledWith('role');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RoleEntity);
      expect(result[0].name).toBe('Admin');
    });

    it('should filter roles by name using ILIKE when nombre is provided', async () => {
      const result = await repository.findAll('Admin');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'role.name ILIKE :name',
        { name: '%Admin%' },
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Admin');
    });

    it('should return empty array when no roles match', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await repository.findAll('NonExistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return RoleEntity when found', async () => {
      const result = await repository.findById('role-uuid');

      expect(roleOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'role-uuid' },
      });
      expect(result).toBeInstanceOf(RoleEntity);
      expect(result?.id).toBe('role-uuid');
    });

    it('should return null when not found', async () => {
      jest.spyOn(roleOrmRepo, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.findById('missing');

      expect(result).toBeNull();
    });
  });

  describe('findByNameExcludingId', () => {
    it('should return RoleEntity when name matches a different id', async () => {
      jest
        .spyOn(mockQueryBuilder, 'getMany')
        .mockResolvedValueOnce([
          { ...mockOrmEntity, id: 'other-uuid', name: 'Coord' },
        ]);

      const result = await repository.findByNameExcludingId(
        'Coord',
        'role-uuid',
      );

      expect(roleOrmRepo.createQueryBuilder).toHaveBeenCalledWith('role');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(role.name) = LOWER(:name)',
        { name: 'Coord' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'role.id != :excludeId',
        { excludeId: 'role-uuid' },
      );
      expect(result).toBeInstanceOf(RoleEntity);
      expect(result?.name).toBe('Coord');
    });

    it('should return null when no other role has that name', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await repository.findByNameExcludingId(
        'Unique',
        'role-uuid',
      );

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should find existing, mutate fields, and save', async () => {
      const updatedEntity = new RoleEntity(
        'role-uuid',
        'Admin',
        'Updated description',
        'INACTIVO',
        [],
        new Date(),
        new Date(),
      );

      const result = await repository.update(updatedEntity);

      expect(roleOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'role-uuid' },
      });
      expect(roleOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(RoleEntity);
      expect(result.id).toBe('role-uuid');
      expect(result.description).toBe('Updated description');
      expect(result.status).toBe('INACTIVO');
    });
  });

  describe('countUsersByRoleId', () => {
    it('should return the number of users with the given role', async () => {
      jest.spyOn(userOrmRepo, 'count').mockResolvedValueOnce(3);

      const result = await repository.countUsersByRoleId('role-uuid');

      expect(userOrmRepo.count).toHaveBeenCalledWith({
        where: { role: { id: 'role-uuid' } },
      });
      expect(result).toBe(3);
    });

    it('should return 0 when no users have the role', async () => {
      const result = await repository.countUsersByRoleId('unused-role');

      expect(result).toBe(0);
    });
  });
});
