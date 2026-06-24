/* eslint-disable @typescript-eslint/unbound-method */
import { ListServicesUseCase } from './list-services.use-case';
import { IServiceRepository } from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { ListServicesDto } from '../presentation/dto/list-services.dto';

describe('ListServicesUseCase', () => {
  let useCase: ListServicesUseCase;
  let mockRepository: jest.Mocked<IServiceRepository>;

  const sampleService = new ServiceEntity(
    '1',
    'Consultoría TI',
    150.5,
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
    useCase = new ListServicesUseCase(mockRepository);
  });

  it('should return a paginated response with a fixed page size of 10', async () => {
    mockRepository.findPaginated.mockResolvedValue({
      data: [sampleService],
      total: 1,
    });

    const result = await useCase.execute({});

    expect(result.content).toEqual([sampleService]);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
    expect(result.totalElements).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(mockRepository.findPaginated).toHaveBeenCalledWith({
      name: undefined,
      category: undefined,
      isActive: undefined,
      page: 0,
      size: 10,
    });
  });

  it('should forward filters and the requested page to the repository', async () => {
    mockRepository.findPaginated.mockResolvedValue({ data: [], total: 0 });

    const query: ListServicesDto = {
      name: 'cons',
      category: 'TI',
      isActive: true,
      page: 2,
    };
    await useCase.execute(query);

    expect(mockRepository.findPaginated).toHaveBeenCalledWith({
      name: 'cons',
      category: 'TI',
      isActive: true,
      page: 2,
      size: 10,
    });
  });

  it('should round totalPages up when the total is not a multiple of the page size', async () => {
    mockRepository.findPaginated.mockResolvedValue({ data: [], total: 23 });

    const result = await useCase.execute({});

    expect(result.totalPages).toBe(3);
  });
});
