import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IServiceRepository } from '../domain/service.repository';
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
    );
  }

  async save(service: ServiceEntity): Promise<ServiceEntity> {
    const ormEntity = this.repo.create({
      id: service.id,
      name: service.name,
      basePrice: service.basePrice,
      isActive: service.isActive,
    });
    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<ServiceEntity | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByName(name: string): Promise<ServiceEntity | null> {
    const found = await this.repo.findOne({ where: { name } });
    return found ? this.toDomain(found) : null;
  }
}
