import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from '../infrastructure/user.orm-entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthUseCase {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string): Promise<{ token: string; expiraEn: number }> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.status === 'Blocked' || (user.blockedUntil && user.blockedUntil > new Date())) {
      throw new ForbiddenException('Usuario bloqueado. Intente más tarde.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.status = 'Blocked';
        // Block for 15 minutes
        user.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.userRepository.save(user);
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Reset failed attempts on successful login
    if (user.failedAttempts > 0 || user.blockedUntil) {
      user.failedAttempts = 0;
      user.status = 'Active';
      user.blockedUntil = null;
      await this.userRepository.save(user);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name || 'User',
    };

    return {
      token: await this.jwtService.signAsync(payload),
      expiraEn: 28800, // 8 hours in seconds
    };
  }
}
