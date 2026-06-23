import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../domain/user.repository';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserOrmEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async save(user: UserOrmEntity): Promise<UserOrmEntity> {
    return this.repository.save(user);
  }
}
