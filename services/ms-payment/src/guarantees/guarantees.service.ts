import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuaranteeDto } from './dto/create-guarantee.dto';
import { UpdateGuaranteeDto } from './dto/update-guarantee.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class GuaranteesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    contractId?: string;
    type?: string;
    status?: string;
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

    if (query.status) {
      where.status = query.status;
    }

    const [guarantees, total] = await Promise.all([
      this.prisma.guarantee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.guarantee.count({ where }),
    ]);

    return buildPaginatedResponse(guarantees, total, page, limit);
  }

  async findOne(id: string) {
    const guarantee = await this.prisma.guarantee.findUnique({
      where: { id },
    });

    if (!guarantee) {
      throw new NotFoundException('Garantie non trouvee');
    }

    return guarantee;
  }

  async create(dto: CreateGuaranteeDto) {
    return this.prisma.guarantee.create({
      data: {
        contractId: dto.contractId,
        contractReference: dto.contractReference,
        type: dto.type,
        amount: dto.amount,
        issuer: dto.issuer,
        issueDate: new Date(dto.issueDate),
        expiryDate: new Date(dto.expiryDate),
      },
    });
  }

  async update(id: string, dto: UpdateGuaranteeDto) {
    const guarantee = await this.findOne(id);

    if (guarantee.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Seule une garantie au statut ACTIVE peut etre modifiee',
      );
    }

    const data: Record<string, unknown> = {};

    if (dto.amount !== undefined) {
      data.amount = dto.amount;
    }

    if (dto.issuer !== undefined) {
      data.issuer = dto.issuer;
    }

    if (dto.expiryDate !== undefined) {
      data.expiryDate = new Date(dto.expiryDate);
    }

    return this.prisma.guarantee.update({
      where: { id },
      data,
    });
  }

  async findByContract(contractId: string) {
    return this.prisma.guarantee.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async release(id: string) {
    const guarantee = await this.findOne(id);

    if (guarantee.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Seule une garantie au statut ACTIVE peut etre liberee',
      );
    }

    return this.prisma.guarantee.update({
      where: { id },
      data: {
        status: 'LIBEREE',
        releasedAt: new Date(),
      },
    });
  }
}
