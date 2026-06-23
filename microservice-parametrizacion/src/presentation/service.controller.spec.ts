import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from './service.controller';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { CreateServiceDto } from './dto/create-service.dto';

describe('ServiceController', () => {
  let controller: ServiceController;
  let useCase: CreateServiceUseCase;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue({ id: 1, name: 'Test Service' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        {
          provide: CreateServiceUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
    useCase = module.get<CreateServiceUseCase>(CreateServiceUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call use case and return result', async () => {
    const dto = { name: 'Test', description: 'Desc', price: 100 };
    const result = await controller.create(dto as unknown as CreateServiceDto);

    expect(jest.spyOn(useCase, 'execute')).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, name: 'Test Service' });
  });
});
