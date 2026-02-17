import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id: dto.requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande de paiement non trouvee');
    }

    return this.prisma.invoice.create({
      data: {
        requestId: dto.requestId,
        invoiceNumber: dto.invoiceNumber,
        amount: dto.amount,
        invoiceDate: new Date(dto.invoiceDate),
        description: dto.description,
      },
    });
  }

  async findByRequest(requestId: string) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande de paiement non trouvee');
    }

    return this.prisma.invoice.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
