import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// App base
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbConfig } from './infrastructure/db.config';
import { ServiceModule } from './service.module';
import { ClientModule } from './client.module';
import { UserModule } from './user.module';

// Auth feature
import { AuthModule } from './auth/auth.module';
import { AuthUseCase } from './application/auth.use-case';
import { AuthController } from './presentation/auth.controller';
import { UserOrmEntity } from './infrastructure/user.orm-entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dbConfig),
    TypeOrmModule.forFeature([UserOrmEntity]),
    AuthModule,
    ServiceModule,
    ClientModule,
    UserModule,
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
