import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRoleRepository } from '../domain/role.repository';
import { RoleEntity } from '../domain/role.entity';
import { RoleOrmEntity } from './role.orm-entity';

@Injectable()
export class RoleRepositoryImpl implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly repo: Repository<RoleOrmEntity>,
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
}
