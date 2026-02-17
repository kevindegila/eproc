import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class ExecutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; contractId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.contractId) {
      where.contractId = query.contractId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [executions, total] = await Promise.all([
      this.prisma.execution.findMany({
        where,
        skip,
        take: limit,
        include: {
          reports: { orderBy: { reportDate: 'desc' }, take: 1 },
          receptions: { orderBy: { receptionDate: 'desc' } },
          amendments: { orderBy: { createdAt: 'desc' } },
          _count: { select: { reports: true, attachments: true, receptions: true, amendments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.execution.count({ where }),
    ]);

    return buildPaginatedResponse(executions, total, page, limit);
  }

  async findOne(id: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id },
      include: {
        reports: { orderBy: { reportDate: 'desc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
        receptions: { orderBy: { receptionDate: 'desc' } },
        amendments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    return execution;
  }

  async create(dto: CreateExecutionDto, userId: string) {
    return this.prisma.execution.create({
      data: {
        contractId: dto.contractId,
        contractReference: dto.contractReference,
        progressPercent: dto.progressPercent || 0,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : undefined,
        observations: dto.observations,
        createdBy: userId,
      },
      include: {
        reports: true,
        attachments: true,
        receptions: true,
        amendments: true,
      },
    });
  }

  async update(id: string, dto: UpdateExecutionDto) {
    await this.findOne(id);

    return this.prisma.execution.update({
      where: { id },
      data: {
        progressPercent: dto.progressPercent,
        expectedEndDate: dto.expectedEndDate ? new Date(dto.expectedEndDate) : undefined,
        actualEndDate: dto.actualEndDate ? new Date(dto.actualEndDate) : undefined,
        observations: dto.observations,
      },
      include: {
        reports: true,
        attachments: true,
        receptions: true,
        amendments: true,
      },
    });
  }

  async start(id: string) {
    const execution = await this.findOne(id);

    if (execution.status !== 'NON_DEMARRE') {
      throw new BadRequestException(
        'Seule une execution au statut NON_DEMARRE peut etre demarree',
      );
    }

    return this.prisma.execution.update({
      where: { id },
      data: {
        status: 'EN_COURS',
        startDate: new Date(),
      },
    });
  }

  async suspend(id: string) {
    const execution = await this.findOne(id);

    if (execution.status !== 'EN_COURS') {
      throw new BadRequestException(
        'Seule une execution au statut EN_COURS peut etre suspendue',
      );
    }

    return this.prisma.execution.update({
      where: { id },
      data: { status: 'SUSPENDU' },
    });
  }

  async resume(id: string) {
    const execution = await this.findOne(id);

    if (execution.status !== 'SUSPENDU') {
      throw new BadRequestException(
        'Seule une execution au statut SUSPENDU peut etre reprise',
      );
    }

    return this.prisma.execution.update({
      where: { id },
      data: { status: 'EN_COURS' },
    });
  }

  async provisionalReception(id: string) {
    const execution = await this.findOne(id);

    if (execution.status !== 'EN_COURS') {
      throw new BadRequestException(
        'Seule une execution au statut EN_COURS peut faire l\'objet d\'une reception provisoire',
      );
    }

    return this.prisma.execution.update({
      where: { id },
      data: { status: 'RECEPTION_PROVISOIRE' },
    });
  }

  async definitiveReception(id: string) {
    const execution = await this.findOne(id);

    if (execution.status !== 'RECEPTION_PROVISOIRE') {
      throw new BadRequestException(
        'Seule une execution au statut RECEPTION_PROVISOIRE peut faire l\'objet d\'une reception definitive',
      );
    }

    return this.prisma.execution.update({
      where: { id },
      data: {
        status: 'TERMINE',
        progressPercent: 100,
        actualEndDate: new Date(),
      },
    });
  }
}
