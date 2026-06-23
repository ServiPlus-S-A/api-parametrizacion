import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dbConfig } from './infrastructure/db.config';

import { AuthUseCase } from './application/auth.use-case';
import { AuthController } from './presentation/auth.controller';
import { UserOrmEntity } from './infrastructure/user.orm-entity';

import { ClientOrmEntity } from './infrastructure/client.orm-entity';
import { ClientRepositoryImpl } from './infrastructure/client.repository.impl';
import { CreateClientUseCase } from './application/create-client.use-case';
import { ClientController } from './presentation/client.controller';
import { CLIENT_REPOSITORY_TOKEN } from './domain/client.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbConfig),
    TypeOrmModule.forFeature([UserOrmEntity, ClientOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AppController, AuthController, ClientController],
  providers: [
    AppService,
    JwtStrategy,
    AuthUseCase,
    // Client feature
    {
      provide: CLIENT_REPOSITORY_TOKEN,
      useClass: ClientRepositoryImpl,
    },
    CreateClientUseCase,
  ],
})
export class AppModule { }

