import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { UserRepositoryImpl } from './infrastructure/user.repository.impl';
import { USER_REPOSITORY_TOKEN } from './domain/user.repository';
import { UpdateUserUseCase } from './application/update-user.use-case';
import { UserController } from './presentation/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    UpdateUserUseCase,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [UpdateUserUseCase, USER_REPOSITORY_TOKEN],
})
export class UserModule {}
