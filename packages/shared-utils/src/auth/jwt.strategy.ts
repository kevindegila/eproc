import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@eproc/shared-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'eproc-dev-jwt-secret-change-in-production',
    });
  }

  async validate(payload: IJwtPayload): Promise<IJwtPayload> {
    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
      organizationId: payload.organizationId,
    };
  }
}
