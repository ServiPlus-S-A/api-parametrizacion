import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IServiceRepository,
  ServiceListFilters,
  PaginatedServices,
} from '../domain/service.repository';
import { ServiceEntity } from '../domain/service.entity';
import { ServiceOrmEntity } from './service.orm-entity';

@Injectable()
export class ServiceRepositoryImpl implements IServiceRepository {
  constructor(
    @InjectRepository(ServiceOrmEntity)
    private readonly repo: Repository<ServiceOrmEntity>,
  ) {}

  private toDomain(ormEntity: ServiceOrmEntity): ServiceEntity {
    return new ServiceEntity(
      ormEntity.id,
      ormEntity.name,
      Number(ormEntity.basePrice),
      ormEntity.isActive,
      ormEntity.category,
      ormEntity.unitOfMeasure,
    );
  }

  async save(service: ServiceEntity): Promise<ServiceEntity> {
    const ormEntity = this.repo.create({
      id: service.id,
      name: service.name,
      basePrice: service.basePrice,
      isActive: service.isActive,
      category: service.category,
      unitOfMeasure: service.unit,
    });
    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByName(name: string): Promise<ServiceEntity | null> {
    // Búsqueda case-insensitive: el nombre del servicio es único ignorando mayúsculas.
    const found = await this.repo
      .createQueryBuilder('service')
      .where('LOWER(service.name) = LOWER(:name)', { name })
      .getOne();
    return found ? this.toDomain(found) : null;
  }

  async findPaginated(filters: ServiceListFilters): Promise<PaginatedServices> {
    const qb = this.repo.createQueryBuilder('service');

    if (filters.name) {
      // Búsqueda parcial e insensible a mayúsculas sobre el nombre.
      qb.andWhere('LOWER(service.name) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }
    if (filters.category) {
      qb.andWhere('service.category = :category', {
        category: filters.category,
      });
    }
    if (filters.isActive !== undefined) {
      qb.andWhere('service.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    const [rows, total] = await qb
      .orderBy('service.createdAt', 'DESC')
      .skip(filters.page * filters.size)
      .take(filters.size)
      .getManyAndCount();

    return {
      data: rows.map((row) => this.toDomain(row)),
      total,
    };
  }
}
