import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { UpdateUserDto } from './dto/update-user.dto';

/* eslint-disable @typescript-eslint/unbound-method */

describe('UserController', () => {
  let controller: UserController;
  let useCase: jest.Mocked<UpdateUserUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UpdateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    useCase = module.get(UpdateUserUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should call UpdateUserUseCase and return the result', async () => {
      const dto: UpdateUserDto = {
        nombre: 'Nuevo',
        roleId: 'uuid',
        estado: 'Active',
      };

      const mockResult = { id: 'user-uuid', estado: 'Active' };
      useCase.execute.mockResolvedValue(mockResult);

      const result = await controller.update('user-uuid', dto);

      expect(useCase.execute).toHaveBeenCalledWith('user-uuid', dto);
      expect(result).toEqual(mockResult);
    });
  });
});
