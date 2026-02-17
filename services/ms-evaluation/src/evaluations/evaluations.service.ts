import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationSessionDto } from './dto/create-evaluation-session.dto';
import { UpdateEvaluationSessionDto } from './dto/update-evaluation-session.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; dacId?: string; type?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.dacId) {
      where.dacId = query.dacId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [sessions, total] = await Promise.all([
      this.prisma.evaluationSession.findMany({
        where,
        skip,
        take: limit,
        include: { scores: true },
        orderBy: { sessionDate: 'desc' },
      }),
      this.prisma.evaluationSession.count({ where }),
    ]);

    return buildPaginatedResponse(sessions, total, page, limit);
  }

  async findOne(id: string) {
    const session = await this.prisma.evaluationSession.findUnique({
      where: { id },
      include: { scores: true },
    });

    if (!session) {
      throw new NotFoundException('Session d\'evaluation non trouvee');
    }

    return session;
  }

  async create(dto: CreateEvaluationSessionDto) {
    return this.prisma.evaluationSession.create({
      data: {
        ...dto,
        sessionDate: new Date(dto.sessionDate),
        type: dto.type || 'TECHNIQUE',
      },
    });
  }

  async update(id: string, dto: UpdateEvaluationSessionDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.sessionDate) {
      data.sessionDate = new Date(dto.sessionDate);
    }

    return this.prisma.evaluationSession.update({
      where: { id },
      data,
    });
  }

  async close(id: string) {
    const session = await this.findOne(id);

    if (session.status === 'TERMINEE') {
      throw new NotFoundException('Cette session d\'evaluation est deja terminee');
    }

    return this.prisma.evaluationSession.update({
      where: { id },
      data: { status: 'TERMINEE' },
      include: { scores: true },
    });
  }
}
