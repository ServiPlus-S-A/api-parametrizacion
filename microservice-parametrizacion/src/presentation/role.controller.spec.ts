/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { RoleController } from './role.controller';
import { ListRolesUseCase } from '../application/list-roles.use-case';
import { GetRoleUseCase } from '../application/get-role.use-case';
import { UpdateRoleUseCase } from '../application/update-role.use-case';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('RoleController', () => {
  let controller: RoleController;
  let listRolesUseCase: ListRolesUseCase;
  let getRoleUseCase: GetRoleUseCase;
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
    const mockGetUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'role-uuid',
        nombre: 'Admin',
        descripcion: 'Full access',
        estado: 'ACTIVO',
        permisos: [],
        creadoEn: '2026-01-01T00:00:00.000Z',
        actualizadoEn: '2026-06-23T00:00:00.000Z',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        { provide: ListRolesUseCase, useValue: mockListUseCase },
        { provide: GetRoleUseCase, useValue: mockGetUseCase },
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
    getRoleUseCase = module.get<GetRoleUseCase>(GetRoleUseCase);
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

  describe('getById', () => {
    it('should call the get use case and return the role detail', async () => {
      const result = await controller.getById('role-uuid');

      expect(getRoleUseCase.execute).toHaveBeenCalledWith('role-uuid');
      expect(result).toEqual({
        id: 'role-uuid',
        nombre: 'Admin',
        descripcion: 'Full access',
        estado: 'ACTIVO',
        permisos: [],
        creadoEn: '2026-01-01T00:00:00.000Z',
        actualizadoEn: '2026-06-23T00:00:00.000Z',
      });
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
