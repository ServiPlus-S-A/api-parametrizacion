/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateServiceUseCase } from './update-service.use-case';
import { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { UpdateServiceDto } from '../presentation/dto/update-service.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let mockRepository: jest.Mocked<IServiceRepository>;

  const existingService = new ServiceEntity(
    'service-uuid',
    'Consultoría TI',
    150,
    true,
    'TI',
    'Hora',
  );

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findPaginated: jest.fn(),
    };

    useCase = new UpdateServiceUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update all fields successfully when no conflicts', async () => {
    const dto: UpdateServiceDto = {
      name: 'Nuevo Nombre',
      basePrice: 200,
      category: 'Cloud',
      unit: 'Día',
      isActive: false,
    };

    mockRepository.findById.mockResolvedValue(existingService);
    mockRepository.findByName.mockResolvedValue(null);
    mockRepository.update.mockImplementation((s) => Promise.resolve(s));

    const result = await useCase.execute('service-uuid', dto);

    expect(mockRepository.findById).toHaveBeenCalledWith('service-uuid');
    expect(mockRepository.findByName).toHaveBeenCalledWith('Nuevo Nombre');
    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Nuevo Nombre');
    expect(result.basePrice).toBe(200);
    expect(result.isActive).toBe(false);
  });

  it('should update with partial fields, keeping existing values for omitted ones', async () => {
    const dto: UpdateServiceDto = { basePrice: 300 };

    mockRepository.findById.mockResolvedValue(existingService);
    mockRepository.update.mockImplementation((s) => Promise.resolve(s));

    const result = await useCase.execute('service-uuid', dto);

    expect(mockRepository.findByName).not.toHaveBeenCalled();
    expect(result.name).toBe('Consultoría TI'); // unchanged
    expect(result.basePrice).toBe(300); // updated
    expect(result.category).toBe('TI'); // unchanged
  });

  it('should not check name conflict when name is not being changed', async () => {
    const dto: UpdateServiceDto = { name: 'Consultoría TI' }; // same name

    mockRepository.findById.mockResolvedValue(existingService);
    mockRepository.update.mockImplementation((s) => Promise.resolve(s));

    await useCase.execute('service-uuid', dto);

    expect(mockRepository.findByName).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when service does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-uuid', { name: 'Test' }),
    ).rejects.toThrow(NotFoundException);

    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when new name belongs to another service', async () => {
    const dto: UpdateServiceDto = { name: 'Nombre Existente' };
    const anotherService = new ServiceEntity(
      'other-uuid',
      'Nombre Existente',
      100,
      true,
    );

    mockRepository.findById.mockResolvedValue(existingService);
    mockRepository.findByName.mockResolvedValue(anotherService);

    await expect(useCase.execute('service-uuid', dto)).rejects.toThrow(
      ConflictException,
    );

    expect(mockRepository.update).not.toHaveBeenCalled();
  });
});
