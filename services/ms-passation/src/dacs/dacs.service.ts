import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDacDto } from './dto/create-dac.dto';
import { UpdateDacDto } from './dto/update-dac.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class DacsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    marketType?: string;
    organizationId?: string;
    publicOnly?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.publicOnly) {
      where.status = 'PUBLIE';
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.marketType) {
      where.marketType = query.marketType;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [dacs, total] = await Promise.all([
      this.prisma.dAC.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: { documents: true, withdrawals: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dAC.count({ where }),
    ]);

    return buildPaginatedResponse(dacs, total, page, limit);
  }

  async findOne(id: string) {
    const dac = await this.prisma.dAC.findUnique({
      where: { id },
      include: {
        documents: true,
        withdrawals: {
          orderBy: { withdrawalDate: 'desc' },
        },
      },
    });

    if (!dac) {
      throw new NotFoundException('Dossier d\'Appel a Concurrence non trouve');
    }

    return dac;
  }

  async create(dto: CreateDacDto, createdBy: string, userOrganizationId?: string) {
    // Resolve title: accept "subject" as alias for "title"
    const title = dto.title || dto.subject;
    if (!title) {
      throw new BadRequestException('Le titre (title ou subject) est requis');
    }

    // Resolve organizationId: from DTO or from JWT
    const organizationId = dto.organizationId || userOrganizationId;
    if (!organizationId) {
      throw new BadRequestException(
        'L\'identifiant de l\'organisation est requis (organizationId ou via le token)',
      );
    }

    // Auto-generate reference if not provided
    const reference = dto.reference || await this.generateReference(dto.marketType);

    const existing = await this.prisma.dAC.findUnique({
      where: { reference },
    });

    if (existing) {
      throw new ConflictException('Un DAC avec cette reference existe deja');
    }

    const data: Record<string, unknown> = {
      reference,
      title,
      description: dto.description || title,
      organizationId,
      marketType: dto.marketType,
      procurementMethod: dto.procurementMethod,
      estimatedAmount: dto.estimatedAmount ?? 0,
      createdBy,
    };

    if (dto.fundingSource) data.fundingSource = dto.fundingSource;
    if (dto.ppmReference) data.ppmReference = dto.ppmReference;
    if (dto.executionDelay) data.executionDelay = dto.executionDelay;
    if (dto.closingDate) data.closingDate = new Date(dto.closingDate);
    if (dto.criteria !== undefined) data.criteria = dto.criteria;

    return this.prisma.dAC.create({ data: data as never });
  }

  private async generateReference(marketType: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = marketType === 'TRAVAUX' ? 'TRAV'
      : marketType === 'FOURNITURES' ? 'FOUR'
      : marketType === 'SERVICES' ? 'SERV'
      : 'PI';
    const count = await this.prisma.dAC.count();
    const seq = String(count + 1).padStart(3, '0');
    return `DAC/${prefix}/${year}/${seq}`;
  }

  async update(id: string, dto: UpdateDacDto) {
    const dac = await this.findOne(id);

    if (dac.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seuls les DAC en statut BROUILLON peuvent etre modifies',
      );
    }

    const data: Record<string, unknown> = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.marketType !== undefined) data.marketType = dto.marketType;
    if (dto.procurementMethod !== undefined) data.procurementMethod = dto.procurementMethod;
    if (dto.estimatedAmount !== undefined) data.estimatedAmount = dto.estimatedAmount;
    if (dto.closingDate !== undefined) data.closingDate = new Date(dto.closingDate);
    if (dto.criteria !== undefined) data.criteria = dto.criteria;

    return this.prisma.dAC.update({
      where: { id },
      data: data as never,
    });
  }

  async remove(id: string) {
    const dac = await this.findOne(id);

    if (dac.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seuls les DAC en statut BROUILLON peuvent etre supprimes',
      );
    }

    await this.prisma.dAC.delete({ where: { id } });
    return { message: 'Dossier d\'Appel a Concurrence supprime avec succes' };
  }

  async submit(id: string) {
    const dac = await this.findOne(id);

    if (dac.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seuls les DAC en statut BROUILLON peuvent etre soumis pour validation',
      );
    }

    return this.prisma.dAC.update({
      where: { id },
      data: { status: 'SOUMIS' },
    });
  }

  async publish(id: string) {
    const dac = await this.findOne(id);

    if (dac.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seuls les DAC en statut BROUILLON peuvent etre publies',
      );
    }

    if (dac.documents.length === 0) {
      throw new BadRequestException(
        'Le DAC doit contenir au moins un document avant publication',
      );
    }

    return this.prisma.dAC.update({
      where: { id },
      data: {
        status: 'PUBLIE',
        publicationDate: new Date(),
      },
    });
  }

  async close(id: string) {
    const dac = await this.findOne(id);

    if (dac.status !== 'PUBLIE') {
      throw new BadRequestException(
        'Seuls les DAC en statut PUBLIE peuvent etre clotures',
      );
    }

    return this.prisma.dAC.update({
      where: { id },
      data: {
        status: 'CLOTURE',
        closingDate: new Date(),
      },
    });
  }

  async cancel(id: string) {
    const dac = await this.findOne(id);

    if (dac.status === 'ANNULE') {
      throw new BadRequestException('Ce DAC est deja annule');
    }

    if (dac.status === 'CLOTURE') {
      throw new BadRequestException(
        'Un DAC cloture ne peut pas etre annule',
      );
    }

    return this.prisma.dAC.update({
      where: { id },
      data: { status: 'ANNULE' },
    });
  }
}
