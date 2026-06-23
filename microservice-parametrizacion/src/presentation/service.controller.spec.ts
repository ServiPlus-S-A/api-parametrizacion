import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from './service.controller';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('ServiceController', () => {
  let controller: ServiceController;
  let createUseCase: CreateServiceUseCase;
  let listUseCase: ListServicesUseCase;

  const createdService = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Consultoría TI',
    basePrice: 150.5,
    isActive: true,
    category: 'TI',
    unit: 'Hora',
  };

  const paginatedResult = {
    content: [createdService],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockCreateUseCase = {
      execute: jest.fn().mockResolvedValue(createdService),
    };
    const mockListUseCase = {
      execute: jest.fn().mockResolvedValue(paginatedResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        { provide: CreateServiceUseCase, useValue: mockCreateUseCase },
        { provide: ListServicesUseCase, useValue: mockListUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServiceController>(ServiceController);
    createUseCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
    listUseCase = module.get<ListServicesUseCase>(ListServicesUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call the create use case and return the created service', async () => {
      const dto: CreateServiceDto = {
        name: 'Consultoría TI',
        category: 'TI',
        basePrice: 150.5,
        unit: 'Hora',
      };

      const result = await controller.create(dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(createUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdService);
    });
  });

  describe('list', () => {
    it('should call the list use case and return the paginated result', async () => {
      const query: ListServicesDto = { name: 'cons', page: 0 };

      const result = await controller.list(query);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(listUseCase.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResult);
    });
  });
});
