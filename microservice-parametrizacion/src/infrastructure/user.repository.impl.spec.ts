import { Test, TestingModule } from '@nestjs/testing';
import { UserRepositoryImpl } from './user.repository.impl';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { Repository } from 'typeorm';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UserRepositoryImpl', () => {
  let repository: UserRepositoryImpl;
  let typeOrmRepository: Repository<UserOrmEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepositoryImpl,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepositoryImpl>(UserRepositoryImpl);
    typeOrmRepository = module.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = new UserOrmEntity();
      mockUser.id = 'uuid-123';
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await repository.findById('uuid-123');
      expect(result).toEqual(mockUser);
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        relations: ['role'],
      });
    });

    it('should return null if not found', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findById('uuid-999');
      expect(result).toBeNull();
      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-999' },
        relations: ['role'],
      });
    });
  });

  describe('save', () => {
    it('should save and return the user', async () => {
      const mockUser = new UserOrmEntity();
      mockUser.id = 'uuid-123';
      jest.spyOn(typeOrmRepository, 'save').mockResolvedValue(mockUser);

      const result = await repository.save(mockUser);
      expect(result).toEqual(mockUser);
      expect(typeOrmRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
