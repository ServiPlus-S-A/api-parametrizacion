/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleRepositoryImpl } from './role.repository.impl';
import { RoleOrmEntity } from './role.orm-entity';
import { RoleEntity } from '../domain/role.entity';

describe('RoleRepositoryImpl', () => {
  let repository: RoleRepositoryImpl;
  let roleOrmRepo: Repository<RoleOrmEntity>;

  const mockOrmEntity = {
    id: 'role-uuid',
    name: 'Admin',
    description: 'Full access',
    status: 'ACTIVO',
    permissions: ['READ_CLIENT', 'WRITE_CLIENT'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockQueryBuilder: {
    andWhere: jest.Mock;
    orderBy: jest.Mock;
    getMany: jest.Mock;
  };

  beforeEach(async () => {
    mockQueryBuilder = {
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
          },
        },
      ],
    }).compile();

    repository = module.get<RoleRepositoryImpl>(RoleRepositoryImpl);
    roleOrmRepo = module.get<Repository<RoleOrmEntity>>(
      getRepositoryToken(RoleOrmEntity),
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
});
