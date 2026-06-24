/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { ListRolesUseCase } from '../application/list-roles.use-case';
import { UpdateRoleUseCase } from '../application/update-role.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let listRolesUseCase: ListRolesUseCase;
  let updateRoleUseCase: UpdateRoleUseCase;

  beforeEach(async () => {
    const mockListUseCase = {
      execute: jest.fn().mockResolvedValue({
        content: [{ nombre: 'Admin', estado: 'ACTIVO', permisos: [] }],
      }),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'role-uuid',
        actualizadoAt: '2026-06-23T19:00:00.000Z',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        { provide: ListRolesUseCase, useValue: mockListUseCase },
        { provide: UpdateRoleUseCase, useValue: mockUpdateUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RoleController>(RoleController);
    listRolesUseCase = module.get<ListRolesUseCase>(ListRolesUseCase);
    updateRoleUseCase = module.get<UpdateRoleUseCase>(UpdateRoleUseCase);
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
        content: [{ nombre: 'Admin', estado: 'ACTIVO', permisos: [] }],
      });
    });

    it('should call the use case without filter when nombre is not provided', async () => {
      await controller.list({});

      expect(listRolesUseCase.execute).toHaveBeenCalledWith({});
    });
  });

  describe('update', () => {
    it('should call the update use case and return the result', async () => {
      const result = await controller.update('role-uuid', {
        descripcion: 'Nuevo alcance',
        estado: 'ACTIVO',
      });

      expect(updateRoleUseCase.execute).toHaveBeenCalledWith('role-uuid', {
        descripcion: 'Nuevo alcance',
        estado: 'ACTIVO',
      });
      expect(result).toEqual({
        id: 'role-uuid',
        actualizadoAt: '2026-06-23T19:00:00.000Z',
      });
    });
  });
});
