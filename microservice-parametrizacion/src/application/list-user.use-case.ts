import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY_TOKEN } from '../domain/user.repository';
import type {
  IUserRepository,
  PaginatedResult,
} from '../domain/user.repository';
import type { UserEntity } from '../domain/user.entity';
import { ListUserQueryDto } from '../presentation/dto/list-user.dto';

@Injectable()
export class ListUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListUserQueryDto): Promise<PaginatedResult<UserEntity>> {
    return this.userRepository.findAll({
      q: query.q,
      estado: query.estado,
      page: query.page ?? 0,
      size: query.size ?? 10,
    });
  }
}
