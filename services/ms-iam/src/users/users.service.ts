import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; search?: string; role?: string; status?: string; organizationId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.role) {
      where.userRoles = { some: { role: { code: query.role } } };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          userRoles: { include: { role: true } },
          organization: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sanitized = users.map(({ password: _, ...user }) => ({
      ...user,
      roles: user.userRoles.map((ur) => ur.role.code),
    }));

    return buildPaginatedResponse(sanitized, total, page, limit);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: true } },
        organization: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const { password: _, ...result } = user;
    return { ...result, roles: user.userRoles.map((ur) => ur.role.code) };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { roleIds, ...userData } = dto;

    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        ...(roleIds && roleIds.length > 0
          ? { userRoles: { create: roleIds.map((roleId) => ({ roleId })) } }
          : {}),
      },
      include: {
        userRoles: { include: { role: true } },
        organization: true,
      },
    });

    const { password: _, ...result } = user;
    return { ...result, roles: user.userRoles.map((ur) => ur.role.code) };
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    const { roleIds, ...userData } = dto;

    if (roleIds) {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId: id, roleId })),
      });
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: userData,
      include: {
        userRoles: { include: { role: true } },
        organization: true,
      },
    });

    const { password: _, ...result } = user;
    return { ...result, roles: user.userRoles.map((ur) => ur.role.code) };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Utilisateur supprimé avec succès' };
  }
}
