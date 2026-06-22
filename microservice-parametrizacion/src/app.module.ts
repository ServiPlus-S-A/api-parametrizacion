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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbConfig),
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    JwtStrategy,
    AuthUseCase,
  ],
})
export class AppModule {}
