import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthUseCase } from '../application/auth.use-case';

describe('AuthController', () => {
  let controller: AuthController;
  let useCase: AuthUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthUseCase,
          useValue: {
            login: jest
              .fn()
              .mockResolvedValue({ token: 'test-token', expiraEn: 28800 }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    useCase = module.get<AuthUseCase>(AuthUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authUseCase.login', async () => {
    const loginSpy = jest.spyOn(useCase, 'login');
    const result = await controller.login({
      correo: 'test@a.com',
      contrasena: 'pwd',
    });
    expect(loginSpy).toHaveBeenCalledWith('test@a.com', 'pwd');
    expect(result).toEqual({ token: 'test-token', expiraEn: 28800 });
  });

  it('should return menu based on role', () => {
    const resultAdmin = controller.getMenu({
      user: { role: 'Admin', userId: 'uuid-admin', email: 'admin@test.com' },
    });
    expect(resultAdmin.modulos).toContain('usuarios');

    const resultUser = controller.getMenu({
      user: { role: 'User', userId: 'uuid-user', email: 'user@test.com' },
    });
    expect(resultUser.modulos).not.toContain('usuarios');
    expect(resultUser.modulos).toContain('clientes');
  });
});
