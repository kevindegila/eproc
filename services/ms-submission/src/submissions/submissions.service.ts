import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    dacId?: string;
    operatorId?: string;
    status?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.dacId) {
      where.dacId = query.dacId;
    }

    if (query.operatorId) {
      where.operatorId = query.operatorId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        include: {
          files: true,
          receipt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return buildPaginatedResponse(submissions, total, page, limit);
  }

  async findOne(id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        files: true,
        receipt: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Soumission non trouvee');
    }

    return submission;
  }

  async create(dto: CreateSubmissionDto) {
    return this.prisma.submission.create({
      data: {
        dacId: dto.dacId,
        dacReference: dto.dacReference,
        operatorId: dto.operatorId,
        operatorName: dto.operatorName,
      },
      include: {
        files: true,
        receipt: true,
      },
    });
  }

  async update(id: string, dto: UpdateSubmissionDto) {
    await this.findOne(id);

    return this.prisma.submission.update({
      where: { id },
      data: dto,
      include: {
        files: true,
        receipt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.submission.delete({ where: { id } });
    return { message: 'Soumission supprimee avec succes' };
  }

  async submit(id: string) {
    const submission = await this.findOne(id);

    if (submission.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seule une soumission au statut BROUILLON peut etre soumise',
      );
    }

    return this.prisma.submission.update({
      where: { id },
      data: {
        status: 'SOUMISE',
        submittedAt: new Date(),
      },
      include: {
        files: true,
        receipt: true,
      },
    });
  }

  async withdraw(id: string) {
    const submission = await this.findOne(id);

    if (submission.status !== 'SOUMISE') {
      throw new BadRequestException(
        'Seule une soumission au statut SOUMISE peut etre retiree',
      );
    }

    return this.prisma.submission.update({
      where: { id },
      data: {
        status: 'RETIREE',
      },
      include: {
        files: true,
        receipt: true,
      },
    });
  }
}
