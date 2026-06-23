import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from './service.controller';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('ServiceController', () => {
  let controller: ServiceController;
  let useCase: CreateServiceUseCase;

  const createdService = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Consultoría TI',
    basePrice: 150.5,
    isActive: true,
    category: 'TI',
    unit: 'Hora',
  };

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue(createdService),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: CreateServiceUseCase,
          useValue: mockUseCase,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServiceController>(ServiceController);
    useCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call use case and return the created service', async () => {
    const dto: CreateServiceDto = {
      name: 'Consultoría TI',
      category: 'TI',
      basePrice: 150.5,
      unit: 'Hora',
    };

    const result = await controller.create(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(useCase.execute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(createdService);
  });
});
