import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    marketType?: string;
    isActive?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.marketType) {
      where.marketType = query.marketType;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [templates, total] = await Promise.all([
      this.prisma.dACTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dACTemplate.count({ where }),
    ]);

    return {
      success: true,
      data: templates,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(id: string) {
    const template = await this.prisma.dACTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Modele de document non trouve');
    }

    return template;
  }

  async create(dto: CreateTemplateDto) {
    return this.prisma.dACTemplate.create({
      data: {
        name: dto.name,
        marketType: dto.marketType,
        filePath: dto.filePath,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateTemplateDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.marketType !== undefined) data.marketType = dto.marketType;
    if (dto.filePath !== undefined) data.filePath = dto.filePath;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.dACTemplate.update({
      where: { id },
      data: data as never,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.dACTemplate.delete({ where: { id } });
    return { message: 'Modele de document supprime avec succes' };
  }
}
