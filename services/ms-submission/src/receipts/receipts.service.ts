import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateReceiptNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `AR-${year}-${random}`;
  }

  async create(dto: CreateReceiptDto) {
    // Verifier que la soumission existe
    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      include: { receipt: true },
    });

    if (!submission) {
      throw new NotFoundException('Soumission non trouvee');
    }

    if (submission.receipt) {
      throw new ConflictException(
        'Un accuse de reception existe deja pour cette soumission',
      );
    }

    // Generer un numero d'accuse unique
    let receiptNumber = this.generateReceiptNumber();
    let exists = await this.prisma.submissionReceipt.findUnique({
      where: { receiptNumber },
    });

    while (exists) {
      receiptNumber = this.generateReceiptNumber();
      exists = await this.prisma.submissionReceipt.findUnique({
        where: { receiptNumber },
      });
    }

    return this.prisma.submissionReceipt.create({
      data: {
        submissionId: dto.submissionId,
        receiptNumber,
        receivedBy: dto.receivedBy,
      },
      include: {
        submission: true,
      },
    });
  }

  async findBySubmission(submissionId: string) {
    // Verifier que la soumission existe
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Soumission non trouvee');
    }

    const receipt = await this.prisma.submissionReceipt.findUnique({
      where: { submissionId },
      include: {
        submission: true,
      },
    });

    if (!receipt) {
      throw new NotFoundException(
        'Aucun accuse de reception trouve pour cette soumission',
      );
    }

    return receipt;
  }
}
