import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';
import { PpmParserService, PpmParseResult } from './ppm-parser.service';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ppmParser: PpmParserService,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    organizationId?: string;
    fiscalYear?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.fiscalYear) {
      where.fiscalYear = query.fiscalYear;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [plans, total] = await Promise.all([
      this.prisma.forecastPlan.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { entries: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.forecastPlan.count({ where }),
    ]);

    return buildPaginatedResponse(plans, total, page, limit);
  }

  async findOne(id: string) {
    const plan = await this.prisma.forecastPlan.findUnique({
      where: { id },
      include: { entries: { orderBy: { lineNumber: 'asc' } } },
    });

    if (!plan) {
      throw new NotFoundException('Plan previsionnel non trouve');
    }

    return plan;
  }

  async create(dto: CreatePlanDto, userId: string) {
    return this.prisma.forecastPlan.create({
      data: {
        ...dto,
        totalAmount: dto.totalAmount || 0,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdatePlanDto) {
    const plan = await this.findOne(id);

    if (plan.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un plan au statut BROUILLON peut etre modifie',
      );
    }

    return this.prisma.forecastPlan.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un plan au statut BROUILLON peut etre supprime',
      );
    }

    await this.prisma.forecastPlan.delete({ where: { id } });
    return { message: 'Plan previsionnel supprime avec succes' };
  }

  async submit(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un plan au statut BROUILLON peut etre soumis',
      );
    }

    return this.prisma.forecastPlan.update({
      where: { id },
      data: { status: 'SOUMIS' },
    });
  }

  async validate(id: string) {
    const plan = await this.findOne(id);

    if (plan.status !== 'SOUMIS') {
      throw new BadRequestException(
        'Seul un plan au statut SOUMIS peut etre valide',
      );
    }

    return this.prisma.forecastPlan.update({
      where: { id },
      data: { status: 'VALIDE' },
    });
  }

  async publish(id: string) {
    const plan = await this.findOne(id);

    if (plan.status === 'PUBLIE') {
      throw new BadRequestException(
        'Ce plan est deja publie',
      );
    }

    return this.prisma.forecastPlan.update({
      where: { id },
      data: { status: 'PUBLIE' },
    });
  }

  async uploadPlan(
    file: Express.Multer.File,
    fiscalYear: number,
    organizationId: string,
    userId: string,
    organizationName?: string,
  ) {
    const parsed: PpmParseResult = await this.ppmParser.parse(
      file.buffer,
      file.originalname,
    );

    const effectiveYear = fiscalYear || parsed.metadata.fiscalYear;

    const totalAmount = parsed.entries.reduce(
      (sum, e) => sum + e.estimatedAmount,
      0,
    );

    // Find the latest version for this org + fiscal year to determine next version number
    const latest = await this.prisma.forecastPlan.findFirst({
      where: { organizationId, fiscalYear: effectiveYear },
      orderBy: { version: 'desc' },
    });

    const newVersion = latest ? latest.version + 1 : 1;

    // Always create a new plan record (old versions remain visible)
    const plan = await this.prisma.forecastPlan.create({
      data: {
        reference: `PPM-${organizationId.substring(0, 10).toUpperCase()}-${effectiveYear}-V${newVersion}`,
        title: `Plan de Passation des Marches - Exercice ${effectiveYear}`,
        fiscalYear: effectiveYear,
        organizationId,
        organizationName: organizationName || undefined,
        totalAmount,
        version: newVersion,
        fileName: file.originalname,
        createdBy: userId,
      },
    });

    await this.createEntries(plan.id, parsed);

    return this.findOne(plan.id);
  }

  private async createEntries(planId: string, parsed: PpmParseResult) {
    const data = parsed.entries.map((entry) => ({
      planId,
      lineNumber: entry.lineNumber,
      description: entry.description,
      marketType: entry.marketType,
      method: entry.method,
      estimatedAmount: entry.estimatedAmount,
      launchQuarter: 1,
      fundingSource: entry.fundingSource,
      referenceCode: entry.referenceCode,
      category: entry.category,
      controlBody: entry.controlBody,
      budgetLine: entry.budgetLine,
      launchAuthDate: entry.launchAuthDate,
      milestones: entry.milestones,
    }));

    await this.prisma.marketEntry.createMany({ data });
  }
}
