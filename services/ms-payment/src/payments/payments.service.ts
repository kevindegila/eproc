import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    const request = await this.prisma.paymentRequest.findUnique({
      where: { id: dto.requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande de paiement non trouvee');
    }

    return this.prisma.payment.create({
      data: {
        requestId: dto.requestId,
        amount: dto.amount,
        paymentDate: new Date(dto.paymentDate),
        paymentMethod: dto.paymentMethod,
        transactionRef: dto.transactionRef,
        observations: dto.observations,
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

    return this.prisma.payment.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
