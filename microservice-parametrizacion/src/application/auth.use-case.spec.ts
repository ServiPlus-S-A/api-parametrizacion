/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthUseCase } from './auth.use-case';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrmEntity } from '../infrastructure/user.orm-entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthUseCase', () => {
  let useCase: AuthUseCase;
  let jwtService: JwtService;

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUseCase,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: mockRepo,
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn().mockResolvedValue('token') },
        },
      ],
    }).compile();

    useCase = module.get<AuthUseCase>(AuthUseCase);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw if user not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(useCase.login('test@a.com', 'pwd')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if user status is Blocked', async () => {
    mockRepo.findOne.mockResolvedValue({ status: 'Blocked' });
    await expect(useCase.login('test@a.com', 'pwd')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw if user is blocked until a future date', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes in future
    mockRepo.findOne.mockResolvedValue({
      status: 'Active',
      blockedUntil: futureDate,
    });
    await expect(useCase.login('test@a.com', 'pwd')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw UnauthorizedException and increment failed attempts on password mismatch', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 'uuid',
      email: 'test@a.com',
      password: 'hashedpassword',
      status: 'Active',
      failedAttempts: 2,
      blockedUntil: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.login('test@a.com', 'wrongpwd')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        failedAttempts: 3,
      }),
    );
  });

  it('should block user and set blockedUntil if failed attempts reach 5', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 'uuid',
      email: 'test@a.com',
      password: 'hashedpassword',
      status: 'Active',
      failedAttempts: 4,
      blockedUntil: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(useCase.login('test@a.com', 'wrongpwd')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        failedAttempts: 5,
        status: 'Blocked',
        blockedUntil: expect.any(Date) as Date,
      }),
    );
  });

  it('should reset failed attempts and log in successfully if credentials are correct', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 'uuid',
      email: 'test@a.com',
      password: 'hashedpassword',
      status: 'Active',
      failedAttempts: 3,
      blockedUntil: new Date(Date.now() - 1000 * 60), // in the past
      role: { name: 'Admin' },
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.login('test@a.com', 'correctpwd');
    expect(result).toEqual({ token: 'token', expiraEn: 28800 });
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        failedAttempts: 0,
        status: 'Active',
        blockedUntil: null,
      }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'uuid',
      email: 'test@a.com',
      role: 'Admin',
    });
  });

  it('should use default role "User" if user has no role defined', async () => {
    mockRepo.findOne.mockResolvedValue({
      id: 'uuid',
      email: 'test@a.com',
      password: 'hashedpassword',
      status: 'Active',
      failedAttempts: 0,
      blockedUntil: null,
      role: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.login('test@a.com', 'correctpwd');
    expect(result).toEqual({ token: 'token', expiraEn: 28800 });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'uuid',
      email: 'test@a.com',
      role: 'User',
    });
  });
});
