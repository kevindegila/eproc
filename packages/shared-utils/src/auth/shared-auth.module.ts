import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

export interface SharedAuthModuleOptions {
  jwtSecret?: string;
  jwtExpiresIn?: string;
}

@Module({})
export class SharedAuthModule {
  static register(options?: SharedAuthModuleOptions): DynamicModule {
    return {
      module: SharedAuthModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: options?.jwtSecret || process.env.JWT_SECRET || 'eproc-dev-jwt-secret-change-in-production',
          signOptions: {
            expiresIn: (options?.jwtExpiresIn || process.env.JWT_EXPIRES_IN || '24h') as any,
          },
        }),
      ],
      providers: [JwtStrategy],
      exports: [JwtModule, PassportModule, JwtStrategy],
    };
  }
}
