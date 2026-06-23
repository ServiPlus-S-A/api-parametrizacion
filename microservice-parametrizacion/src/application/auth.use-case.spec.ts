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
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

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
    await expect(useCase.login('test@a.com', 'pwd')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if user is blocked', async () => {
    mockRepo.findOne.mockResolvedValue({ status: 'Blocked' });
    await expect(useCase.login('test@a.com', 'pwd')).rejects.toThrow(ForbiddenException);
  });
});
