import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { ClientOrmEntity } from './client.orm-entity';

@Injectable()
export class ClientRepositoryImpl implements IClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repo: Repository<ClientOrmEntity>,
  ) {}

  private toDomain(ormEntity: ClientOrmEntity): ClientEntity {
    return new ClientEntity(
      ormEntity.id,
      ormEntity.fullName,
      ormEntity.taxId,
      ormEntity.clientType,
      ormEntity.city,
      ormEntity.email,
      ormEntity.createdBy?.id ?? '',
    );
  }

  async save(client: ClientEntity): Promise<ClientEntity> {
    const ormEntity = this.repo.create({
      id: client.id,
      fullName: client.fullName,
      taxId: client.taxId,
      clientType: client.clientType,
      city: client.city,
      email: client.email,
      createdBy: { id: client.createdById } as any,
    });
    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({ where: { id }, relations: ['createdBy'] });
    return found ? this.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({ where: { email } });
    return found ? this.toDomain(found) : null;
  }

  async findByTaxId(taxId: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({ where: { taxId } });
    return found ? this.toDomain(found) : null;
  }
}
