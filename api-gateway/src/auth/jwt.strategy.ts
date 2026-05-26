import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy {
  // Configured to extract token and validate signature
  constructor() {
    /*
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
    */
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
