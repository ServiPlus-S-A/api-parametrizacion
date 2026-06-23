/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRepositoryImpl } from './service.repository.impl';
import { ServiceOrmEntity } from './service.orm-entity';
import { ServiceEntity } from '../domain/service.entity';

describe('ServiceRepositoryImpl', () => {
  let repository: ServiceRepositoryImpl;
  let typeOrmRepo: Repository<ServiceOrmEntity>;

  const mockOrmEntity = {
    id: 'test-id',
    name: 'Test Service',
    basePrice: 100,
    isActive: true,
    category: 'TI',
    unitOfMeasure: 'Hora',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ServiceOrmEntity;

  const mockServiceEntity = new ServiceEntity(
    'test-id',
    'Test Service',
    100,
    true,
    'TI',
    'Hora',
  );

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(mockOrmEntity),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceRepositoryImpl,
        {
          provide: getRepositoryToken(ServiceOrmEntity),
          useValue: {
            create: jest.fn().mockReturnValue(mockOrmEntity),
            save: jest.fn().mockResolvedValue(mockOrmEntity),
            findOne: jest.fn().mockResolvedValue(mockOrmEntity),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    repository = module.get<ServiceRepositoryImpl>(ServiceRepositoryImpl);
    typeOrmRepo = module.get<Repository<ServiceOrmEntity>>(
      getRepositoryToken(ServiceOrmEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('save', () => {
    it('should map domain fields (incl. category and unit) and return a ServiceEntity', async () => {
      const result = await repository.save(mockServiceEntity);

      expect(typeOrmRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id',
          name: 'Test Service',
          category: 'TI',
          unitOfMeasure: 'Hora',
        }),
      );
      expect(typeOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ServiceEntity);
      expect(result.id).toEqual(mockServiceEntity.id);
      expect(result.unit).toEqual('Hora');
    });
  });

  describe('findById', () => {
    it('should find an entity by id and return domain model', async () => {
      const result = await repository.findById('test-id');
      expect(typeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toBeInstanceOf(ServiceEntity);
      expect(result?.id).toBe('test-id');
    });

    it('should return null if not found', async () => {
      jest.spyOn(typeOrmRepo, 'findOne').mockResolvedValueOnce(null);
      const result = await repository.findById('missing-id');
      expect(result).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find an entity by name ignoring case', async () => {
      const result = await repository.findByName('test service');

      expect(typeOrmRepo.createQueryBuilder).toHaveBeenCalledWith('service');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(service.name) = LOWER(:name)',
        { name: 'test service' },
      );
      expect(result).toBeInstanceOf(ServiceEntity);
      expect(result?.name).toBe('Test Service');
    });

    it('should return null if not found by name', async () => {
      mockQueryBuilder.getOne.mockResolvedValueOnce(null);
      const result = await repository.findByName('Missing Service');
      expect(result).toBeNull();
    });
  });
});
