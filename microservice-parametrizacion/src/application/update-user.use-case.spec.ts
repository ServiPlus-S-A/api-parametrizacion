import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.use-case';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type { IUserRepository } from '../domain/user.repository';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../domain/user.entity';
import * as bcrypt from 'bcrypt';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
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

  it('should update user fields', async () => {
    const existingUser = new UserEntity(
      'uuid-123',
      'Old Name',
      'original@example.com',
      'hashedPass',
      'Active',
      'role-old',
    );

    const updatedUser = new UserEntity(
      'uuid-123',
      'New Name',
      'original@example.com',
      'hashedPass',
      'INACTIVO',
      'role-uuid',
    );

    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute('uuid-123', {
      nombre: 'New Name',
      estado: 'INACTIVO',
      roleId: 'role-uuid',
    });

    expect(result.id).toBe('uuid-123');
    expect(result.estado).toBe('INACTIVO');

    expect(userRepository.update).toHaveBeenCalledWith(
      'uuid-123',
      expect.objectContaining({
        nombre: 'New Name',
        estado: 'INACTIVO',
        rolId: 'role-uuid',
      }),
    );
  });

  it('should hash new password if provided', async () => {
    const existingUser = new UserEntity(
      'uuid-123',
      'Name',
      'test@example.com',
      'oldHash',
      'Active',
      'role-1',
    );

    const updatedUser = new UserEntity(
      'uuid-123',
      'Name',
      'test@example.com',
      'newHash',
      'Active',
      'role-1',
    );

    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.update.mockResolvedValue(updatedUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');

    await useCase.execute('uuid-123', { nuevaClave: 'newPlainPassword' });

    expect(bcrypt.hash).toHaveBeenCalledWith('newPlainPassword', 10);
    expect(userRepository.update).toHaveBeenCalledWith(
      'uuid-123',
      expect.objectContaining({
        clave: 'newHash',
      }),
    );
  });
});
