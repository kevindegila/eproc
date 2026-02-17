import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpeningSessionDto } from './dto/create-opening-session.dto';
import { UpdateOpeningSessionDto } from './dto/update-opening-session.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class OpeningsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; dacId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.dacId) {
      where.dacId = query.dacId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [sessions, total] = await Promise.all([
      this.prisma.openingSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sessionDate: 'desc' },
      }),
      this.prisma.openingSession.count({ where }),
    ]);

    return buildPaginatedResponse(sessions, total, page, limit);
  }

  async findOne(id: string) {
    const session = await this.prisma.openingSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session d\'ouverture non trouvee');
    }

    return session;
  }

  async create(dto: CreateOpeningSessionDto) {
    return this.prisma.openingSession.create({
      data: {
        ...dto,
        sessionDate: new Date(dto.sessionDate),
        presentMembers: dto.presentMembers || [],
      },
    });
  }

  async update(id: string, dto: UpdateOpeningSessionDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.sessionDate) {
      data.sessionDate = new Date(dto.sessionDate);
    }

    return this.prisma.openingSession.update({
      where: { id },
      data,
    });
  }

  async close(id: string) {
    const session = await this.findOne(id);

    if (session.status === 'TERMINEE') {
      throw new NotFoundException('Cette session est deja terminee');
    }

    return this.prisma.openingSession.update({
      where: { id },
      data: { status: 'TERMINEE' },
    });
  }
}
