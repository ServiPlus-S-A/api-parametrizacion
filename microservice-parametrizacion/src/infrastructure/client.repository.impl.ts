import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { ClientOrmEntity } from './client.orm-entity';
import { ClientStatusHistoryOrmEntity } from './client-status-history.orm-entity';

const PAGE_SIZE = 20;

@Injectable()
export class ClientRepositoryImpl implements IClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repo: Repository<ClientOrmEntity>,
    @InjectRepository(ClientStatusHistoryOrmEntity)
    private readonly historyRepo: Repository<ClientStatusHistoryOrmEntity>,
  ) {}

  // ─── Mapping ────────────────────────────────────────────────────────────────

  private toDomain(orm: ClientOrmEntity): ClientEntity {
    return new ClientEntity(
      orm.id,
      orm.fullName,
      orm.taxId,
      orm.clientType,
      orm.city,
      orm.email,
      orm.status as 'Active' | 'Inactive',
      orm.createdAt,
      orm.updatedAt,
    );
  }

  // ─── IClientRepository ───────────────────────────────────────────────────

  async findById(id: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAndPaginate(filters: {
    fullName?: string;
    taxId?: string;
    city?: string;
    status?: 'Active' | 'Inactive';
    page: number;
  }): Promise<{ content: ClientEntity[]; totalPages: number }> {
    const qb = this.repo.createQueryBuilder('client');

    if (filters.fullName) {
      qb.andWhere('client.fullName ILIKE :fullName', {
        fullName: `%${filters.fullName}%`,
      });
    }
    if (filters.taxId) {
      // Exact match — NIT is unique
      qb.andWhere('client.taxId = :taxId', { taxId: filters.taxId });
    }
    if (filters.city) {
      qb.andWhere('client.city ILIKE :city', { city: `%${filters.city}%` });
    }
    if (filters.status) {
      qb.andWhere('client.status = :status', { status: filters.status });
    }

    qb.orderBy('client.createdAt', 'DESC')
      .skip(filters.page * PAGE_SIZE)
      .take(PAGE_SIZE);

    const [items, total] = await qb.getManyAndCount();

    return {
      content: items.map((item) => this.toDomain(item)),
      totalPages: total === 0 ? 1 : Math.ceil(total / PAGE_SIZE),
    };
  }

  async save(client: ClientEntity): Promise<ClientEntity> {
    const ormEntity = this.repo.create({
      id: client.id,
      fullName: client.fullName,
      taxId: client.taxId,
      clientType: client.clientType,
      city: client.city,
      email: client.email,
      status: client.status,
    });
    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async hasActiveSolicitudes(_id: string): Promise<boolean> {
    // TODO: This method depends on the Solicitudes module which does not exist yet.
    // Always returns false until that module is integrated.
    return false;
  }

  async saveStatusHistory(
    clientId: string,
    previousStatus: 'Active' | 'Inactive',
    newStatus: 'Active' | 'Inactive',
    motivo: string,
    changedBy?: string,
  ): Promise<void> {
    const entry = this.historyRepo.create({
      clientId,
      previousStatus,
      newStatus,
      motivo,
      changedBy,
    });
    await this.historyRepo.save(entry);
  }
}
