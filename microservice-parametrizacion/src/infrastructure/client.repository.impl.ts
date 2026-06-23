import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IClientRepository } from '../domain/client.repository';
import { ClientEntity } from '../domain/client.entity';
import { ClientOrmEntity } from './client.orm-entity';
import { ClientStatusHistoryOrmEntity } from './client-status-history.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

const PAGE_SIZE = 20;

@Injectable()
export class ClientRepositoryImpl implements IClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity)
    private readonly repo: Repository<ClientOrmEntity>,
    @InjectRepository(ClientStatusHistoryOrmEntity)
    private readonly historyRepo: Repository<ClientStatusHistoryOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  // ─── Mapping ────────────────────────────────────────────────────────────────

  private toDomain(ormEntity: ClientOrmEntity): ClientEntity {
    return new ClientEntity(
      ormEntity.id,
      ormEntity.fullName,
      ormEntity.taxId,
      ormEntity.clientType,
      ormEntity.city,
      ormEntity.email,
      ormEntity.status as 'Active' | 'Inactive',
      ormEntity.createdBy?.id ?? '',
      ormEntity.user?.id ?? '',
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }

  // ─── IClientRepository ───────────────────────────────────────────────────

  async findById(id: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({
      where: { id },
      relations: ['createdBy', 'user'],
    });
    return found ? this.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({
      where: { email },
      relations: ['createdBy', 'user'],
    });
    return found ? this.toDomain(found) : null;
  }

  async findByTaxId(taxId: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({
      where: { taxId },
      relations: ['createdBy', 'user'],
    });
    return found ? this.toDomain(found) : null;
  }

  async userExists(userId: string): Promise<boolean> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return false;
    }
    const count = await this.userRepo.count({ where: { id: userId } });
    return count > 0;
  }

  async findByUserId(userId: string): Promise<ClientEntity | null> {
    const found = await this.repo.findOne({
      where: { user: { id: userId } },
      relations: ['createdBy', 'user'],
    });
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
      qb.andWhere('client.taxId = :taxId', { taxId: filters.taxId });
    }
    if (filters.city) {
      qb.andWhere('client.city ILIKE :city', { city: `%${filters.city}%` });
    }
    if (filters.status) {
      qb.andWhere('client.status = :status', { status: filters.status });
    }

    qb.leftJoinAndSelect('client.createdBy', 'createdBy')
      .leftJoinAndSelect('client.user', 'user')
      .orderBy('client.createdAt', 'DESC')
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
      createdBy: { id: client.createdById },
      user: { id: client.userId },
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
