import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdatePaymentRequestDto } from './dto/update-payment-request.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class PaymentRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    contractId?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.contractId) {
      where.contractId = query.contractId;
    }

    if (query.search) {
      where.OR = [
        { reference: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { contractReference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      this.prisma.paymentRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { invoices: true, payments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.paymentRequest.count({ where }),
    ]);

    return buildPaginatedResponse(requests, total, page, limit);
  }

  async findOne(id: string) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: {
        invoices: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!request) {
      throw new NotFoundException('Demande de paiement non trouvee');
    }

    return request;
  }

  async create(dto: CreatePaymentRequestDto, userId: string) {
    return this.prisma.paymentRequest.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdatePaymentRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seule une demande au statut BROUILLON peut etre modifiee',
      );
    }

    return this.prisma.paymentRequest.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seule une demande au statut BROUILLON peut etre supprimee',
      );
    }

    await this.prisma.paymentRequest.delete({ where: { id } });
    return { message: 'Demande de paiement supprimee avec succes' };
  }

  async submit(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seule une demande au statut BROUILLON peut etre soumise',
      );
    }

    return this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'SOUMISE',
        submittedAt: new Date(),
      },
    });
  }

  async validate(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'SOUMISE') {
      throw new BadRequestException(
        'Seule une demande au statut SOUMISE peut etre validee',
      );
    }

    return this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'VALIDEE',
        validatedAt: new Date(),
      },
    });
  }

  async reject(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'SOUMISE') {
      throw new BadRequestException(
        'Seule une demande au statut SOUMISE peut etre rejetee',
      );
    }

    return this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'REJETEE',
      },
    });
  }

  async pay(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'VALIDEE') {
      throw new BadRequestException(
        'Seule une demande au statut VALIDEE peut etre payee',
      );
    }

    return this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'PAYEE',
        paidAt: new Date(),
      },
    });
  }
}
