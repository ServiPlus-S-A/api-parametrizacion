import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport'; // Añadido
import { JwtModule } from '@nestjs/jwt'; // Añadido

// App base
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from './infrastructure/db.config';
import { ServiceModule } from './service.module';

// Auth feature
import { AuthModule } from './auth/auth.module';
import { AuthUseCase } from './application/auth.use-case';
import { AuthController } from './presentation/auth.controller';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { JwtStrategy } from './auth/jwt.strategy';

// Client feature
import { ClientOrmEntity } from './infrastructure/client.orm-entity';
import { ClientRepositoryImpl } from './infrastructure/client.repository.impl';
import { CreateClientUseCase } from './application/create-client.use-case';
import { ClientController } from './presentation/client.controller';
import { CLIENT_REPOSITORY_TOKEN } from './domain/client.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbConfig),
    AuthModule,
    ServiceModule,
    TypeOrmModule.forFeature([UserOrmEntity, ClientOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    ClientController
  ],
  providers: [
    AppService,
    JwtStrategy,
    AuthUseCase,
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepositoryImpl,
    },
    CreateClientUseCase,
  ],
})
export class AppModule { }