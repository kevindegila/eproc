import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSignatureDto } from './dto/create-signature.dto';

@Injectable()
export class SignaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSignatureDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrat non trouve');
    }

    if (contract.status !== 'EN_SIGNATURE' && contract.status !== 'SIGNE') {
      throw new BadRequestException(
        'Les signatures ne peuvent etre ajoutees que sur un contrat en statut EN_SIGNATURE ou SIGNE',
      );
    }

    const signature = await this.prisma.contractSignature.create({
      data: {
        contractId: dto.contractId,
        signerName: dto.signerName,
        signerRole: dto.signerRole,
        observations: dto.observations || null,
      },
      include: { contract: true },
    });

    // Automatically transition to SIGNE if still EN_SIGNATURE
    if (contract.status === 'EN_SIGNATURE') {
      await this.prisma.contract.update({
        where: { id: dto.contractId },
        data: {
          status: 'SIGNE',
          signatureDate: new Date(),
        },
      });
    }

    return signature;
  }

  async findByContract(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException('Contrat non trouve');
    }

    const signatures = await this.prisma.contractSignature.findMany({
      where: { contractId },
      orderBy: { signedAt: 'asc' },
    });

    return signatures;
  }
}
