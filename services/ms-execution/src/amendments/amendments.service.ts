import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { UpdateAmendmentDto } from './dto/update-amendment.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class AmendmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; executionId?: string; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.executionId) {
      where.executionId = query.executionId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [amendments, total] = await Promise.all([
      this.prisma.amendment.findMany({
        where,
        skip,
        take: limit,
        include: { execution: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.amendment.count({ where }),
    ]);

    return buildPaginatedResponse(amendments, total, page, limit);
  }

  async findOne(id: string) {
    const amendment = await this.prisma.amendment.findUnique({
      where: { id },
      include: { execution: true },
    });

    if (!amendment) {
      throw new NotFoundException('Avenant non trouve');
    }

    return amendment;
  }

  async create(dto: CreateAmendmentDto, userId: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: dto.executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    const existing = await this.prisma.amendment.findUnique({
      where: { reference: dto.reference },
    });

    if (existing) {
      throw new ConflictException('Un avenant avec cette reference existe deja');
    }

    return this.prisma.amendment.create({
      data: {
        executionId: dto.executionId,
        reference: dto.reference,
        type: dto.type,
        description: dto.description,
        amountChange: dto.amountChange,
        durationChange: dto.durationChange,
        createdBy: userId,
      },
      include: { execution: true },
    });
  }

  async update(id: string, dto: UpdateAmendmentDto) {
    const amendment = await this.findOne(id);

    if (amendment.status === 'APPROUVE') {
      throw new BadRequestException(
        'Un avenant approuve ne peut plus etre modifie',
      );
    }

    return this.prisma.amendment.update({
      where: { id },
      data: {
        type: dto.type,
        description: dto.description,
        amountChange: dto.amountChange,
        durationChange: dto.durationChange,
      },
      include: { execution: true },
    });
  }

  async approve(id: string) {
    const amendment = await this.findOne(id);

    if (amendment.status === 'APPROUVE') {
      throw new BadRequestException('Cet avenant est deja approuve');
    }

    if (amendment.status === 'REJETE') {
      throw new BadRequestException(
        'Un avenant rejete ne peut pas etre approuve',
      );
    }

    return this.prisma.amendment.update({
      where: { id },
      data: {
        status: 'APPROUVE',
        approvedAt: new Date(),
      },
      include: { execution: true },
    });
  }
}
