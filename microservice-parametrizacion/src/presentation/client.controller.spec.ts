import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { CreateClientUseCase } from '../application/create-client.use-case';
import { CreateClientDto } from '../application/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ClientController', () => {
  let controller: ClientController;
  let createUseCase: CreateClientUseCase;

  const mockClient = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'Cliente de Prueba',
    taxId: '900123456-7',
    clientType: 'Empresarial',
    city: 'Bogota',
    email: 'test@email.com',
    userId: 'user-uuid-123',
    createdById: 'admin-uuid-456',
  };

  beforeEach(async () => {
    const mockCreateUseCase = {
      execute: jest.fn().mockResolvedValue(mockClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [
        { provide: CreateClientUseCase, useValue: mockCreateUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientController>(ClientController);
    createUseCase = module.get<CreateClientUseCase>(CreateClientUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the create use case and return the created client', async () => {
      const dto: CreateClientDto = {
        fullName: 'Cliente de Prueba',
        taxId: '900123456-7',
        clientType: 'Empresarial',
        city: 'Bogota',
        email: 'test@email.com',
        userId: 'user-uuid-123',
      };

      const req = {
        user: {
          userId: 'admin-uuid-456',
          email: 'admin@email.com',
          role: 'Admin',
        },
      };

      const result = await controller.create(dto, req);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(createUseCase.execute).toHaveBeenCalledWith(dto, 'admin-uuid-456');
      expect(result).toEqual(mockClient);
    });
  });
});
