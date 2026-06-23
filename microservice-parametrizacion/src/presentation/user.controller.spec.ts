import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { ListUserUseCase } from '../application/list-user.use-case';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UserController', () => {
  let controller: UserController;
  let createUseCase: jest.Mocked<CreateUserUseCase>;
  let listUseCase: jest.Mocked<ListUserUseCase>;
  let updateUseCase: jest.Mocked<UpdateUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ListUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    createUseCase = module.get(CreateUserUseCase);
    listUseCase = module.get(ListUserUseCase);
    updateUseCase = module.get(UpdateUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call CreateUserUseCase and return the result', async () => {
      const dto: CreateUserDto = {
        nombre: 'Miguel',
        email: 'miguel@empresa.com',
        rolId: '123e4567-e89b-12d3-a456-426614174000',
        clave: 'Xy1*abc',
      };

      const mockResult = {
        id: 'user-uuid',
        email: 'miguel@empresa.com',
        estado: 'ACTIVO',
      };
      createUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.create(dto);

      expect(createUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('list', () => {
    it('should call ListUserUseCase and return the result', async () => {
      const query = { page: 0, size: 10 };
      const mockResult = {
        content: [],
        totalElements: 0,
        page: 0,
        size: 10,
        totalPages: 0,
      };
      listUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.list(query);

      expect(listUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call UpdateUserUseCase and return the result', async () => {
      const dto: UpdateUserDto = {
        nombre: 'Nuevo',
        roleId: 'uuid',
        estado: 'Active',
      };

      const mockResult = { id: 'user-uuid', estado: 'Active' };
      updateUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.update('user-uuid', dto);

      expect(updateUseCase.execute).toHaveBeenCalledWith('user-uuid', dto);
      expect(result).toEqual(mockResult);
    });
  });
});
