import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ClientOrmEntity } from './infrastructure/client.orm-entity';
import { ClientStatusHistoryOrmEntity } from './infrastructure/client-status-history.orm-entity';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { ClientRepositoryImpl } from './infrastructure/client.repository.impl';
import { CLIENT_REPOSITORY_TOKEN } from './domain/client.repository';
import { ListClientsUseCase } from './application/list-clients.use-case';
import { ChangeClientStatusUseCase } from './application/change-client-status.use-case';
import { CreateClientUseCase } from './application/create-client.use-case';
import { ClientController } from './presentation/client.controller';
import { AuditLogger } from './transversal/audit.logger';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClientOrmEntity,
      ClientStatusHistoryOrmEntity,
      UserOrmEntity,
    ]),
    AuthModule, // provides JwtAuthGuard, PassportModule, JwtModule
  ],
  controllers: [ClientController],
  providers: [
    AuditLogger,
    RolesGuard,
    ListClientsUseCase,
    ChangeClientStatusUseCase,
    CreateClientUseCase,
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepositoryImpl,
    },
  ],
})
export class ClientModule {}
