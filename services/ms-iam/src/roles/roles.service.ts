import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto, AssignRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: { _count: { select: { userRoles: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        userRoles: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Rôle non trouvé');
    }

    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException('Un rôle avec ce code existe déjà');
    }
    return this.prisma.role.create({ data: dto });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Rôle supprimé avec succès' };
  }

  async assignRole(dto: AssignRoleDto) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId: dto.userId, roleId: dto.roleId } },
    });
    if (existing) {
      throw new ConflictException('Ce rôle est déjà attribué à cet utilisateur');
    }
    return this.prisma.userRole.create({
      data: { userId: dto.userId, roleId: dto.roleId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, role: true },
    });
  }

  async revokeRole(userId: string, roleId: string) {
    const existing = await this.prisma.userRole.findUnique({
      where: { userId_roleId: { userId, roleId } },
    });
    if (!existing) {
      throw new NotFoundException('Attribution de rôle non trouvée');
    }
    await this.prisma.userRole.delete({ where: { userId_roleId: { userId, roleId } } });
    return { message: 'Rôle révoqué avec succès' };
  }
}
