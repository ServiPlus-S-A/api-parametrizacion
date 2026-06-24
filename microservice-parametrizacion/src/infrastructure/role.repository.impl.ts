import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';
import { RoleOrmEntity } from './role.orm-entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class RoleRepositoryImpl implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly repo: Repository<RoleOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  private toDomain(orm: RoleOrmEntity): RoleEntity {
    return new RoleEntity(
      orm.id,
      orm.name,
      orm.description,
      orm.status,
      orm.permissions,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  async findAll(nombre?: string): Promise<RoleEntity[]> {
    const qb = this.repo.createQueryBuilder('role');

    if (nombre) {
      qb.andWhere('role.name ILIKE :name', { name: `%${nombre}%` });
    }

    qb.orderBy('role.name', 'ASC');

    const items = await qb.getMany();
    return items.map((item) => this.toDomain(item));
  }

  async findById(id: string): Promise<RoleEntity | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findByNameExcludingId(
    name: string,
    excludeId: string,
  ): Promise<RoleEntity | null> {
    const items = await this.repo
      .createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name })
      .andWhere('role.id != :excludeId', { excludeId })
      .getMany();

    return items.length > 0 ? this.toDomain(items[0]) : null;
  }

  async update(role: RoleEntity): Promise<RoleEntity> {
    const existing = await this.repo.findOne({ where: { id: role.id } });
    if (!existing) {
      throw new Error('Role not found for update');
    }
    existing.name = role.name;
    existing.description = role.description ?? '';
    existing.status = role.status;
    existing.permissions = role.permissions;
    const saved = await this.repo.save(existing);
    return this.toDomain(saved);
  }

  async countUsersByRoleId(roleId: string): Promise<number> {
    return this.userRepo.count({ where: { role: { id: roleId } } });
  }
}
