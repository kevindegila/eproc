import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDecisionDto } from './dto/create-decision.dto';

@Injectable()
export class DecisionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDecisionDto) {
    const appeal = await this.prisma.appeal.findUnique({
      where: { id: dto.appealId },
    });

    if (!appeal) {
      throw new NotFoundException('Recours non trouve');
    }

    return this.prisma.appealDecision.create({
      data: {
        appealId: dto.appealId,
        decisionDate: new Date(dto.decisionDate),
        decisionType: dto.decisionType,
        summary: dto.summary,
        isInFavor: dto.isInFavor,
        decidedBy: dto.decidedBy,
      },
    });
  }

  async findByAppeal(appealId: string) {
    const appeal = await this.prisma.appeal.findUnique({
      where: { id: appealId },
    });

    if (!appeal) {
      throw new NotFoundException('Recours non trouve');
    }

    return this.prisma.appealDecision.findMany({
      where: { appealId },
      orderBy: { decisionDate: 'desc' },
    });
  }
}
