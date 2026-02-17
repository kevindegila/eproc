import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Injectable()
export class WithdrawalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dacId: string, dto: CreateWithdrawalDto) {
    const dac = await this.prisma.dAC.findUnique({ where: { id: dacId } });

    if (!dac) {
      throw new NotFoundException('Dossier d\'Appel a Concurrence non trouve');
    }

    if (dac.status !== 'PUBLIE') {
      throw new BadRequestException(
        'Les retraits ne sont possibles que pour les DAC en statut PUBLIE',
      );
    }

    // Verifier si l'operateur a deja retire ce DAC
    const existingWithdrawal = await this.prisma.dACWithdrawal.findFirst({
      where: {
        dacId,
        operatorEmail: dto.operatorEmail,
      },
    });

    if (existingWithdrawal) {
      throw new BadRequestException(
        'Cet operateur a deja retire le dossier pour ce DAC',
      );
    }

    return this.prisma.dACWithdrawal.create({
      data: {
        dacId,
        operatorName: dto.operatorName,
        operatorEmail: dto.operatorEmail,
        operatorPhone: dto.operatorPhone,
      },
    });
  }

  async findByDac(dacId: string) {
    const dac = await this.prisma.dAC.findUnique({ where: { id: dacId } });

    if (!dac) {
      throw new NotFoundException('Dossier d\'Appel a Concurrence non trouve');
    }

    return this.prisma.dACWithdrawal.findMany({
      where: { dacId },
      orderBy: { withdrawalDate: 'desc' },
    });
  }
}
