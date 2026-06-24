import { Test, TestingModule } from '@nestjs/testing';
import { ListUserUseCase } from './list-user.use-case';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type {
  IUserRepository,
  PaginatedResult,
} from '../domain/user.repository';
import { UserEntity } from '../domain/user.entity';
import { ListUserQueryDto } from '../presentation/dto/list-user.dto';

/* eslint-disable @typescript-eslint/unbound-method */

describe('ListUserUseCase', () => {
  let useCase: ListUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUserUseCase,
        {
          provide: USER_REPOSITORY_TOKEN,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListUserUseCase>(ListUserUseCase);
    userRepository = module.get(USER_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call repository with default pagination values', async () => {
    const query = new ListUserQueryDto();
    const result: PaginatedResult<UserEntity> = {
      content: [],
      totalElements: 0,
      page: 0,
      size: 10,
      totalPages: 0,
    };
    userRepository.findAll.mockResolvedValue(result);

    const response = await useCase.execute(query);

    expect(userRepository.findAll).toHaveBeenCalledWith({
      q: undefined,
      estado: undefined,
      page: 0,
      size: 10,
    });
    expect(response).toEqual(result);
  });

  it('should forward filters and explicit pagination to repository', async () => {
    const result: PaginatedResult<UserEntity> = {
      content: [
        new UserEntity(
          'user-id',
          'Miguel',
          'miguel@empresa.com',
          'hashed',
          'Active',
          'role-id',
        ),
      ],
      totalElements: 1,
      page: 1,
      size: 5,
      totalPages: 1,
    };
    userRepository.findAll.mockResolvedValue(result);

    const response = await useCase.execute({
      q: 'Miguel',
      estado: 'Active',
      page: 1,
      size: 5,
    });

    expect(userRepository.findAll).toHaveBeenCalledWith({
      q: 'Miguel',
      estado: 'Active',
      page: 1,
      size: 5,
    });
    expect(response).toEqual(result);
  });
});
