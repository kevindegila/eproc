import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArbitrationDto } from './dto/create-arbitration.dto';
import { UpdateArbitrationDto } from './dto/update-arbitration.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class ArbitrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    const [arbitrations, total] = await Promise.all([
      this.prisma.arbitration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.arbitration.count({ where }),
    ]);

    return buildPaginatedResponse(arbitrations, total, page, limit);
  }

  async findOne(id: string) {
    const arbitration = await this.prisma.arbitration.findUnique({
      where: { id },
    });

    if (!arbitration) {
      throw new NotFoundException('Arbitrage non trouve');
    }

    return arbitration;
  }

  async create(dto: CreateArbitrationDto) {
    const count = await this.prisma.arbitration.count();
    const reference = `ARB/ARMP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;

    const data: Record<string, unknown> = {
      ...dto,
      reference,
    };

    if (dto.hearingDate) {
      data.hearingDate = new Date(dto.hearingDate);
    }

    return this.prisma.arbitration.create({
      data: data as Parameters<typeof this.prisma.arbitration.create>[0]['data'],
    });
  }

  async update(id: string, dto: UpdateArbitrationDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };

    if (dto.hearingDate) {
      data.hearingDate = new Date(dto.hearingDate);
    }

    return this.prisma.arbitration.update({
      where: { id },
      data,
    });
  }

  async decide(id: string, decision: string) {
    const arbitration = await this.findOne(id);

    if (arbitration.status === 'DECIDE') {
      throw new BadRequestException('Cet arbitrage a deja fait l\'objet d\'une decision');
    }

    return this.prisma.arbitration.update({
      where: { id },
      data: {
        status: 'DECIDE',
        decision,
        decisionDate: new Date(),
      },
    });
  }
}
