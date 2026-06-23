import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/role.orm-entity';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { USER_REPOSITORY_TOKEN } from './domain/user.repository';
import { CreateUserUseCase } from './application/create-user.use-case';
import { ListUserUseCase } from './application/list-user.use-case';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity])],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    ListUserUseCase,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [CreateUserUseCase, USER_REPOSITORY_TOKEN],
})
export class UserModule {}
