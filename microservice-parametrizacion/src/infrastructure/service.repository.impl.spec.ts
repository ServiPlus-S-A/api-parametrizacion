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
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(mockOrmEntity),
    getManyAndCount: jest.fn().mockResolvedValue([[mockOrmEntity], 1]),
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

  describe('update', () => {
    it('should map fields and persist using save (upsert by PK)', async () => {
      const result = await repository.update(mockServiceEntity);

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
      expect(result.id).toBe('test-id');
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

  describe('findPaginated', () => {
    it('should apply name, category and isActive filters with pagination and ordering', async () => {
      const result = await repository.findPaginated({
        name: 'cons',
        category: 'TI',
        isActive: true,
        page: 1,
        size: 10,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(service.name) LIKE LOWER(:name)',
        { name: '%cons%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'service.category = :category',
        { category: 'TI' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'service.isActive = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'service.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.total).toBe(1);
      expect(result.data[0]).toBeInstanceOf(ServiceEntity);
    });

    it('should not apply any filter when none are provided', async () => {
      const result = await repository.findPaginated({ page: 0, size: 10 });

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(result.total).toBe(1);
    });
  });
});
