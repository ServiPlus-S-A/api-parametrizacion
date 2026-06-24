import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserUseCase } from './create-user.use-case';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type { IUserRepository } from '../domain/user.repository';
import { RoleOrmEntity } from '../infrastructure/role.orm-entity';
import { CreateUserDto } from '../presentation/dto/create-user.dto';
import { UserEntity } from '../domain/user.entity';

/* eslint-disable @typescript-eslint/unbound-method */

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<Repository<RoleOrmEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleOrmEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
    roleRepository = module.get(getRepositoryToken(RoleOrmEntity));
  });

  const dto: CreateUserDto = {
    nombre: 'Miguel',
    email: 'miguel@empresa.com',
    rolId: '123e4567-e89b-12d3-a456-426614174000',
    clave: 'Abc123*',
  };

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw ConflictException if email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(
      new UserEntity(
        'user-id',
        dto.nombre,
        dto.email,
        'hashed',
        'Active',
        dto.rolId,
      ),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(roleRepository.findOne).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if role does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    roleRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    expect(roleRepository.findOne).toHaveBeenCalledWith({
      where: { id: dto.rolId },
    });
  });

  it('should throw BadRequestException if role is not active', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    roleRepository.findOne.mockResolvedValue({
      id: dto.rolId,
      status: 'INACTIVO',
    } as RoleOrmEntity);

    await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
  });

  it('should hash password, save user and return public response', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    roleRepository.findOne.mockResolvedValue({
      id: dto.rolId,
      status: 'Active',
    } as RoleOrmEntity);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    userRepository.save.mockImplementation((user) => Promise.resolve(user));

    const result = await useCase.execute(dto);

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.clave, 10);
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: dto.nombre,
        email: dto.email,
        clave: 'hashed-password',
        estado: 'Active',
        rolId: dto.rolId,
      }),
    );
    expect(typeof result.id).toBe('string');
    expect(result.email).toBe(dto.email);
    expect(result.estado).toBe('ACTIVO');
  });
});
