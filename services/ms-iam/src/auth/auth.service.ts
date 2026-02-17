import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { IJwtPayload } from '@eproc/shared-types';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: { role: true },
        },
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Votre compte est désactivé. Contactez l\'administrateur.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const payload: IJwtPayload = {
      sub: user.id,
      email: user.email,
      roles: roles as IJwtPayload['roles'],
      organizationId: user.organizationId || undefined,
    };

    const accessToken = this.jwtService.sign({ ...payload });
    const refreshToken = this.jwtService.sign({ ...payload }, {
      secret: process.env.JWT_REFRESH_SECRET || 'eproc-dev-refresh-secret-change-in-production',
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        organizationId: user.organizationId,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
          sigle: user.organization.sigle,
        } : null,
        roles,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify<IJwtPayload>(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'eproc-dev-refresh-secret-change-in-production',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { userRoles: { include: { role: true } } },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Token de rafraîchissement invalide');
      }

      const roles = user.userRoles.map((ur) => ur.role.code);
      const newPayload: IJwtPayload = {
        sub: user.id,
        email: user.email,
        roles: roles as IJwtPayload['roles'],
        organizationId: user.organizationId || undefined,
      };

      return {
        accessToken: this.jwtService.sign({ ...newPayload }),
        refreshToken: this.jwtService.sign({ ...newPayload }, {
          secret: process.env.JWT_REFRESH_SECRET || 'eproc-dev-refresh-secret-change-in-production',
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
        }),
      };
    } catch {
      throw new UnauthorizedException('Token de rafraîchissement invalide ou expiré');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: { include: { role: true } },
        organization: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      organizationId: user.organizationId,
      organization: user.organization,
      roles: user.userRoles.map((ur) => ur.role.code),
    };
  }
}
