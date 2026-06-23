import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '../infrastructure/user.orm-entity';
import { AuthUseCase } from '../application/auth.use-case';
import { AuthController } from '../presentation/auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthUseCase, JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, PassportModule, JwtModule],
})
export class AuthModule {}
