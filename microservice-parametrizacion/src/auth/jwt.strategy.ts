import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../infrastructure/user.orm-entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

interface ValidatedUser {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    const { sub: userId, email, role, ...rest } = payload;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException();
    }

    return { userId, email, role, ...rest };
  }
}
