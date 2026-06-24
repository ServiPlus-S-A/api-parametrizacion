import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserOrmEntity } from '../infrastructure/user.orm-entity';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';

/* eslint-disable @typescript-eslint/unbound-method */

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepository: Repository<UserOrmEntity>;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepository = module.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity),
    );
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return payload if user is Active', async () => {
    const payload: JwtPayload = {
      sub: 'uuid',
      email: 'test@example.com',
      role: 'admin',
    };
    jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue({ status: 'Active' } as UserOrmEntity);

    const result = await strategy.validate(payload);
    expect(result).toEqual({
      userId: 'uuid',
      email: 'test@example.com',
      role: 'admin',
    });
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'uuid' },
    });
  });

  it('should throw UnauthorizedException if user is INACTIVO', async () => {
    const payload: JwtPayload = {
      sub: 'uuid',
      email: 'test@example.com',
      role: 'admin',
    };
    jest
      .spyOn(userRepository, 'findOne')
      .mockResolvedValue({ status: 'INACTIVO' } as UserOrmEntity);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found', async () => {
    const payload: JwtPayload = {
      sub: 'uuid',
      email: 'test@example.com',
      role: 'admin',
    };
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  describe('when JWT_SECRET is not set', () => {
    it('should fall back to default secretKey', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: getRepositoryToken(UserOrmEntity),
            useValue: { findOne: jest.fn() },
          },
        ],
      }).compile();
      const strategyWithoutSecret = module.get<JwtStrategy>(JwtStrategy);
      expect(strategyWithoutSecret).toBeDefined();
      process.env.JWT_SECRET = originalSecret;
    });
  });
});
