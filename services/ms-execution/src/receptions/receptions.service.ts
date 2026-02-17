import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceptionDto } from './dto/create-reception.dto';

@Injectable()
export class ReceptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReceptionDto) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: dto.executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    if (dto.type !== 'PROVISOIRE' && dto.type !== 'DEFINITIVE') {
      throw new BadRequestException(
        'Le type de reception doit etre PROVISOIRE ou DEFINITIVE',
      );
    }

    if (dto.type === 'DEFINITIVE') {
      const hasProvisoire = await this.prisma.reception.findFirst({
        where: { executionId: dto.executionId, type: 'PROVISOIRE' },
      });

      if (!hasProvisoire) {
        throw new BadRequestException(
          'Une reception provisoire doit exister avant la reception definitive',
        );
      }
    }

    return this.prisma.reception.create({
      data: {
        executionId: dto.executionId,
        type: dto.type,
        receptionDate: new Date(dto.receptionDate),
        pvReference: dto.pvReference,
        observations: dto.observations,
        members: dto.members || [],
        createdBy: dto.createdBy,
      },
      include: {
        execution: true,
      },
    });
  }

  async findByExecution(executionId: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    return this.prisma.reception.findMany({
      where: { executionId },
      orderBy: { receptionDate: 'desc' },
    });
  }
}
