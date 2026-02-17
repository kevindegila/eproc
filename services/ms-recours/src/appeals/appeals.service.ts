import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { UpdateAppealDto } from './dto/update-appeal.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class AppealsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; type?: string; status?: string; complainantId?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.complainantId) {
      where.complainantId = query.complainantId;
    }

    const [appeals, total] = await Promise.all([
      this.prisma.appeal.findMany({
        where,
        skip,
        take: limit,
        include: { decisions: true },
        orderBy: { filedAt: 'desc' },
      }),
      this.prisma.appeal.count({ where }),
    ]);

    return buildPaginatedResponse(appeals, total, page, limit);
  }

  async findOne(id: string) {
    const appeal = await this.prisma.appeal.findUnique({
      where: { id },
      include: { decisions: true },
    });

    if (!appeal) {
      throw new NotFoundException('Recours non trouve');
    }

    return appeal;
  }

  async create(dto: CreateAppealDto) {
    const count = await this.prisma.appeal.count();
    const reference = `REC/ARMP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;

    return this.prisma.appeal.create({
      data: {
        ...dto,
        reference,
      },
    });
  }

  async update(id: string, dto: UpdateAppealDto) {
    await this.findOne(id);

    return this.prisma.appeal.update({
      where: { id },
      data: { ...dto },
      include: { decisions: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.appeal.delete({
      where: { id },
    });
  }

  async instruct(id: string) {
    const appeal = await this.findOne(id);

    if (appeal.status !== 'DEPOSE') {
      throw new BadRequestException('Seul un recours au statut DEPOSE peut etre mis en instruction');
    }

    return this.prisma.appeal.update({
      where: { id },
      data: { status: 'EN_INSTRUCTION' },
      include: { decisions: true },
    });
  }

  async scheduleHearing(id: string) {
    const appeal = await this.findOne(id);

    if (appeal.status !== 'EN_INSTRUCTION') {
      throw new BadRequestException('Seul un recours en instruction peut etre programme pour une audience');
    }

    return this.prisma.appeal.update({
      where: { id },
      data: { status: 'AUDIENCE' },
      include: { decisions: true },
    });
  }

  async close(id: string) {
    const appeal = await this.findOne(id);

    if (appeal.status === 'CLOTURE') {
      throw new BadRequestException('Ce recours est deja cloture');
    }

    return this.prisma.appeal.update({
      where: { id },
      data: { status: 'CLOTURE' },
      include: { decisions: true },
    });
  }
}
