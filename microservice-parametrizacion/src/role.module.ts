import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RoleOrmEntity } from './infrastructure/role.orm-entity';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { RoleRepositoryImpl } from './infrastructure/role.repository.impl';
import { RoleSeeder } from './infrastructure/role-seeder';
import { ROLE_REPOSITORY_TOKEN } from './domain/role.repository';
import { ListRolesUseCase } from './application/list-roles.use-case';
import { UpdateRoleUseCase } from './application/update-role.use-case';
import { RoleController } from './presentation/role.controller';
import { RolesGuard } from './auth/roles.guard';
import { AuditLogger } from './transversal/audit.logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleOrmEntity, UserOrmEntity]),
    AuthModule,
  ],
  controllers: [RoleController],
  providers: [
    RoleSeeder,
    RolesGuard,
    AuditLogger,
    ListRolesUseCase,
    UpdateRoleUseCase,
    {
      provide: ROLE_REPOSITORY_TOKEN,
      useClass: RoleRepositoryImpl,
    },
  ],
})
export class RoleModule {}
