import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class AwardsService {
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

    const [awards, total] = await Promise.all([
      this.prisma.provisionalAward.findMany({
        where,
        skip,
        take: limit,
        orderBy: { awardDate: 'desc' },
      }),
      this.prisma.provisionalAward.count({ where }),
    ]);

    return buildPaginatedResponse(awards, total, page, limit);
  }

  async findOne(id: string) {
    const award = await this.prisma.provisionalAward.findUnique({
      where: { id },
    });

    if (!award) {
      throw new NotFoundException('Attribution provisoire non trouvee');
    }

    return award;
  }

  async create(dto: CreateAwardDto) {
    return this.prisma.provisionalAward.create({
      data: {
        ...dto,
        awardDate: new Date(dto.awardDate),
      },
    });
  }

  async update(id: string, dto: UpdateAwardDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = { ...dto };
    if (dto.awardDate) {
      data.awardDate = new Date(dto.awardDate);
    }

    return this.prisma.provisionalAward.update({
      where: { id },
      data,
    });
  }

  async confirm(id: string) {
    const award = await this.findOne(id);

    if (award.status === 'DEFINITIF') {
      throw new NotFoundException('Cette attribution est deja definitive');
    }

    return this.prisma.provisionalAward.update({
      where: { id },
      data: { status: 'DEFINITIF' },
    });
  }
}
