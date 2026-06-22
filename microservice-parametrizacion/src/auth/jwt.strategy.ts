import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extract JWT from Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use the Supabase JWT secret from environment
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  // Payload is automatically decoded and verified by passport-jwt
  async validate(payload: any) {
    // Supabase payload generally contains: aud, exp, sub (user id), email, role
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      ...payload
    };
  }
}
