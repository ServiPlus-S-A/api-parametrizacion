import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.use-case';
import {
  USER_REPOSITORY_TOKEN,
  UserRepository,
} from '../domain/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UserOrmEntity } from '../infrastructure/user.orm-entity';
import * as bcrypt from 'bcrypt';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findById: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid-id', {})).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update user fields and ignore email', async () => {
    const existingUser = new UserOrmEntity();
    existingUser.id = 'uuid-123';
    existingUser.email = 'original@example.com';
    existingUser.fullName = 'Old Name';

    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.save.mockImplementation((u) => Promise.resolve(u));

    const result = await useCase.execute('uuid-123', {
      nombre: 'New Name',
      estado: 'INACTIVO',
      roleId: 'role-uuid',
    });

    expect(result.id).toBe('uuid-123');
    expect(result.estado).toBe('INACTIVO');

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'New Name',
        status: 'INACTIVO',
        role: expect.objectContaining({ id: 'role-uuid' }),
      }),
    );
  });

  it('should hash new password if provided', async () => {
    const existingUser = new UserOrmEntity();
    existingUser.id = 'uuid-123';
    existingUser.password = 'oldHash';

    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.save.mockImplementation((u) => Promise.resolve(u));
    (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

    await useCase.execute('uuid-123', { nuevaClave: 'newPlainPassword' });

    expect(bcrypt.hash).toHaveBeenCalledWith('newPlainPassword', 10);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'newHash',
      }),
    );
  });
});
