import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceOrmEntity } from './infrastructure/service.orm-entity';
import { ServiceRepositoryImpl } from './infrastructure/service.repository.impl';
import { SERVICE_REPOSITORY_TOKEN } from './domain/service.repository';
import { CreateServiceUseCase } from './application/create-service.use-case';
import { ServiceController } from './presentation/service.controller';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrmEntity]), AuthModule],
  controllers: [ServiceController],
  providers: [
    CreateServiceUseCase,
    RolesGuard,
    {
      provide: SERVICE_REPOSITORY_TOKEN,
      useClass: ServiceRepositoryImpl,
    },
  ],
  exports: [CreateServiceUseCase, SERVICE_REPOSITORY_TOKEN],
})
export class ServiceModule {}
