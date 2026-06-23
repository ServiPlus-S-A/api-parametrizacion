import { UserOrmEntity } from '../infrastructure/user.orm-entity';

export const USER_REPOSITORY_TOKEN = 'UserRepository';

export interface UserRepository {
  findById(id: string): Promise<UserOrmEntity | null>;
  save(user: UserOrmEntity): Promise<UserOrmEntity>;
}
