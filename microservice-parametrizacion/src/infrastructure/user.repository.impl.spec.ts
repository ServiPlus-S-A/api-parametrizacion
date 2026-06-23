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
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return a domain entity if found', async () => {
      const mockOrm = new UserOrmEntity();
      mockOrm.id = 'uuid-123';
      mockOrm.fullName = 'Test User';
      mockOrm.email = 'test@example.com';
      mockOrm.password = 'hashed';
      mockOrm.status = 'Active';
      mockOrm.role = { id: 'role-1' } as RoleOrmEntity;

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

      const mockOrm = new UserOrmEntity();
      mockOrm.id = 'uuid-123';
      mockOrm.fullName = 'Test User';
      mockOrm.email = 'test@example.com';
      mockOrm.password = 'hashed';
      mockOrm.status = 'Active';
      mockOrm.role = { id: 'role-1' } as RoleOrmEntity;

      typeOrmRepository.create.mockReturnValue(mockOrm);
      typeOrmRepository.save.mockResolvedValue(mockOrm);

      const result = await repository.save(domainUser);
      expect(result).toBeInstanceOf(UserEntity);
      expect(result.id).toBe('uuid-123');
    });
  });
});
