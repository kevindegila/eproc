import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@Injectable()
export class EntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchByReference(q: string) {
    if (!q || q.length < 2) return [];

    return this.prisma.marketEntry.findMany({
      where: {
        referenceCode: { contains: q, mode: 'insensitive' },
      },
      include: {
        plan: { select: { reference: true, fiscalYear: true, version: true, status: true } },
      },
      orderBy: { referenceCode: 'asc' },
      take: 15,
    });
  }

  async findAllByPlan(planId: string) {
    const plan = await this.prisma.forecastPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan previsionnel non trouve');
    }

    return this.prisma.marketEntry.findMany({
      where: { planId },
      orderBy: { lineNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.marketEntry.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!entry) {
      throw new NotFoundException('Entree de marche non trouvee');
    }

    return entry;
  }

  async create(planId: string, dto: CreateEntryDto) {
    const plan = await this.prisma.forecastPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan previsionnel non trouve');
    }

    const entry = await this.prisma.marketEntry.create({
      data: {
        ...dto,
        planId,
      },
    });

    // Recalculer le montant total du plan
    await this.recalculatePlanTotal(planId);

    return entry;
  }

  async update(id: string, dto: UpdateEntryDto) {
    const entry = await this.findOne(id);

    const updated = await this.prisma.marketEntry.update({
      where: { id },
      data: dto,
    });

    // Recalculer le montant total du plan
    await this.recalculatePlanTotal(entry.planId);

    return updated;
  }

  async remove(id: string) {
    const entry = await this.findOne(id);

    await this.prisma.marketEntry.delete({ where: { id } });

    // Recalculer le montant total du plan
    await this.recalculatePlanTotal(entry.planId);

    return { message: 'Entree de marche supprimee avec succes' };
  }

  private async recalculatePlanTotal(planId: string) {
    const result = await this.prisma.marketEntry.aggregate({
      where: { planId },
      _sum: { estimatedAmount: true },
    });

    await this.prisma.forecastPlan.update({
      where: { id: planId },
      data: { totalAmount: result._sum.estimatedAmount || 0 },
    });
  }
}
