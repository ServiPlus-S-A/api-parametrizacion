import { UserEntity } from './user.entity';

export interface UserFindAllParams {
  q?: string;
  estado?: string;
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(params: UserFindAllParams): Promise<PaginatedResult<UserEntity>>;
}

export const USER_REPOSITORY_TOKEN = Symbol('IUserRepository');
