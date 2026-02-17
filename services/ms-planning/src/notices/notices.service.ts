import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    organizationId?: string;
    fiscalYear?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }

    if (query.fiscalYear) {
      where.fiscalYear = query.fiscalYear;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { reference: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [notices, total] = await Promise.all([
      this.prisma.generalNotice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.generalNotice.count({ where }),
    ]);

    return buildPaginatedResponse(notices, total, page, limit);
  }

  async findOne(id: string) {
    const notice = await this.prisma.generalNotice.findUnique({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException('Avis general non trouve');
    }

    return notice;
  }

  async create(dto: CreateNoticeDto, userId: string) {
    return this.prisma.generalNotice.create({
      data: {
        ...dto,
        createdBy: userId,
      },
    });
  }

  async update(id: string, dto: UpdateNoticeDto) {
    const notice = await this.findOne(id);

    if (notice.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un avis au statut BROUILLON peut etre modifie',
      );
    }

    return this.prisma.generalNotice.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const notice = await this.findOne(id);

    if (notice.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un avis au statut BROUILLON peut etre supprime',
      );
    }

    await this.prisma.generalNotice.delete({ where: { id } });
    return { message: 'Avis general supprime avec succes' };
  }

  async publish(id: string) {
    const notice = await this.findOne(id);

    if (notice.status !== 'BROUILLON') {
      throw new BadRequestException(
        'Seul un avis au statut BROUILLON peut etre publie',
      );
    }

    return this.prisma.generalNotice.update({
      where: { id },
      data: {
        status: 'PUBLIE',
        publishedAt: new Date(),
      },
    });
  }
}
