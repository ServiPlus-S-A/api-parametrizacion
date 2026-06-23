import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import type {
  UserFindAllParams,
  PaginatedResult,
} from '../domain/user.repository';
import { IUserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/user.entity';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  /** Convierte de ORM (BD) a entidad de dominio (código puro) */
  private toDomain(orm: UserOrmEntity): UserEntity {
    return new UserEntity(
      orm.id,
      orm.fullName,
      orm.email,
      orm.password,
      orm.status,
      orm.role?.id ?? '',
    );
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const ormEntity = this.repo.create({
      id: user.id,
      fullName: user.nombre,
      email: user.email,
      password: user.clave,
      status: user.estado,
      role: { id: user.rolId },
    });
    const saved = await this.repo.save(ormEntity);
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const found = await this.repo.findOne({
      where: { email },
      relations: ['role'],
    });
    return found ? this.toDomain(found) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const found = await this.repo.findOne({
      where: { id },
      relations: ['role'],
    });
    return found ? this.toDomain(found) : null;
  }

  async findAll(
    params: UserFindAllParams,
  ): Promise<PaginatedResult<UserEntity>> {
    const { q, estado, page, size } = params;

    // Construir filtros dinámicamente
    const where: Record<string, unknown>[] = [];

    if (q) {
      // Buscar por nombre O email (coincidencia parcial, sin distinguir mayúsculas)
      where.push(
        { fullName: ILike(`%${q}%`), ...(estado ? { status: estado } : {}) },
        { email: ILike(`%${q}%`), ...(estado ? { status: estado } : {}) },
      );
    } else if (estado) {
      where.push({ status: estado });
    }

    const finalWhere = where.length > 0 ? where : {};
    const [results, total] = await this.repo.findAndCount({
      where: finalWhere,
      relations: ['role'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: results.map((r) => this.toDomain(r)),
      totalElements: total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const existing = await this.repo.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }

    if (data.nombre !== undefined) existing.fullName = data.nombre;
    if (data.estado !== undefined) existing.status = data.estado;
    if (data.clave !== undefined) existing.password = data.clave;
    if (data.rolId !== undefined) existing.role = { id: data.rolId } as any;

    const saved = await this.repo.save(existing);
    return this.toDomain(saved);
  }
}
