/* eslint-disable @typescript-eslint/unbound-method */
import { CreateServiceUseCase } from './create-service.use-case';
import { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { CreateServiceDto } from '../presentation/dto/create-service.dto';
import { ConflictException } from '@nestjs/common';

describe('CreateServiceUseCase', () => {
  let useCase: CreateServiceUseCase;
  let mockRepository: jest.Mocked<IServiceRepository>;

  const validDto: CreateServiceDto = {
    name: 'Consultoría TI',
    category: 'TI',
    basePrice: 150.5,
    unit: 'Hora',
  };

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
    };
    useCase = new CreateServiceUseCase(mockRepository);
  });

  it('should successfully create a new service', async () => {
    mockRepository.findByName.mockResolvedValue(null);
    mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await useCase.execute(validDto);

    expect(result).toBeInstanceOf(ServiceEntity);
    expect(result.name).toEqual('Consultoría TI');
    expect(result.category).toEqual('TI');
    expect(result.unit).toEqual('Hora');
    expect(result.isActive).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should generate a unique uuid for the new service', async () => {
    mockRepository.findByName.mockResolvedValue(null);
    mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

    const result = await useCase.execute(validDto);

    // Formato UUID v4 (8-4-4-4-12 hex).
    expect(result.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('should throw ConflictException if service name already exists', async () => {
    mockRepository.findByName.mockResolvedValue(
      new ServiceEntity('1', 'Consultoría TI', 150.5, true, 'TI', 'Hora'),
    );

    await expect(useCase.execute(validDto)).rejects.toThrow(ConflictException);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
