import { CreateServiceUseCase } from './create-service.use-case';
import { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { CreateServiceDto } from './create-service.dto';
import { ConflictException } from '@nestjs/common';

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let mockRepository: jest.Mocked<IServiceRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
    };
    useCase = new CreateServiceUseCase(mockRepository);
  });

  it('should successfully create a new service', async () => {
    // Arrange
    const dto: CreateServiceDto = { name: 'Mantenimiento Básico', basePrice: 50000 };
    mockRepository.findByName.mockResolvedValue(null);
    mockRepository.save.mockImplementation(async (entity) => entity);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeInstanceOf(ServiceEntity);
    expect(result.name).toEqual('Mantenimiento Básico');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException if service name already exists', async () => {
    // Arrange
    const dto: CreateServiceDto = { name: 'Mantenimiento Básico', basePrice: 50000 };
    mockRepository.findByName.mockResolvedValue(new ServiceEntity('1', 'Mantenimiento Básico', 50000, true));

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
