/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { ListRolesUseCase } from '../application/list-roles.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let listRolesUseCase: ListRolesUseCase;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue({
        content: [{ nombre: 'Admin', estado: 'ACTIVO' }],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [{ provide: ListRolesUseCase, useValue: mockUseCase }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoleController>(RoleController);
    listRolesUseCase = module.get<ListRolesUseCase>(ListRolesUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should call the use case and return the result', async () => {
      const result = await controller.list({ nombre: 'Admin' });

      expect(listRolesUseCase.execute).toHaveBeenCalledWith({
        nombre: 'Admin',
      });
      expect(result).toEqual({
        content: [{ nombre: 'Admin', estado: 'ACTIVO' }],
      });
    });

    it('should call the use case without filter when nombre is not provided', async () => {
      await controller.list({});

      expect(listRolesUseCase.execute).toHaveBeenCalledWith({});
    });
  });
});
