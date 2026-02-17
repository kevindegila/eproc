import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class PenaltiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    contractId?: string;
    type?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.contractId) {
      where.contractId = query.contractId;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [penalties, total] = await Promise.all([
      this.prisma.penalty.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.penalty.count({ where }),
    ]);

    return buildPaginatedResponse(penalties, total, page, limit);
  }

  async create(dto: CreatePenaltyDto, userId: string) {
    return this.prisma.penalty.create({
      data: {
        contractId: dto.contractId,
        contractReference: dto.contractReference,
        type: dto.type,
        amount: dto.amount,
        reason: dto.reason,
        appliedDate: new Date(dto.appliedDate),
        createdBy: userId,
      },
    });
  }

  async findByContract(contractId: string) {
    return this.prisma.penalty.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    const penalty = await this.prisma.penalty.findUnique({
      where: { id },
    });

    if (!penalty) {
      throw new NotFoundException('Penalite non trouvee');
    }

    await this.prisma.penalty.delete({ where: { id } });
    return { message: 'Penalite supprimee avec succes' };
  }
}
