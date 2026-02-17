import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDenunciationDto } from './dto/create-denunciation.dto';
import { UpdateDenunciationDto } from './dto/update-denunciation.dto';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class DenunciationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; status?: string; category?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category;
    }

    const [denunciations, total] = await Promise.all([
      this.prisma.denunciation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { receivedAt: 'desc' },
      }),
      this.prisma.denunciation.count({ where }),
    ]);

    return buildPaginatedResponse(denunciations, total, page, limit);
  }

  async findOne(id: string) {
    const denunciation = await this.prisma.denunciation.findUnique({
      where: { id },
    });

    if (!denunciation) {
      throw new NotFoundException('Denonciation non trouvee');
    }

    return denunciation;
  }

  async create(dto: CreateDenunciationDto) {
    const count = await this.prisma.denunciation.count();
    const reference = `DEN/ARMP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;

    return this.prisma.denunciation.create({
      data: {
        ...dto,
        reference,
        isAnonymous: dto.isAnonymous ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDenunciationDto) {
    await this.findOne(id);

    return this.prisma.denunciation.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.denunciation.delete({
      where: { id },
    });
  }

  async process(id: string, response: string) {
    const denunciation = await this.findOne(id);

    if (denunciation.status === 'TRAITEE') {
      throw new BadRequestException('Cette denonciation a deja ete traitee');
    }

    return this.prisma.denunciation.update({
      where: { id },
      data: {
        status: 'TRAITEE',
        processedAt: new Date(),
        response,
      },
    });
  }
}
