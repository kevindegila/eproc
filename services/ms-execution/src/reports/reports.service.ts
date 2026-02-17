import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: dto.executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    const report = await this.prisma.technicalReport.create({
      data: {
        executionId: dto.executionId,
        title: dto.title,
        reportDate: new Date(dto.reportDate),
        content: dto.content,
        progressPercent: dto.progressPercent,
        createdBy: dto.createdBy,
      },
      include: {
        execution: true,
      },
    });

    // Mettre a jour le pourcentage d'avancement de l'execution si fourni
    if (dto.progressPercent !== undefined) {
      await this.prisma.execution.update({
        where: { id: dto.executionId },
        data: { progressPercent: dto.progressPercent },
      });
    }

    return report;
  }

  async findByExecution(executionId: string) {
    const execution = await this.prisma.execution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      throw new NotFoundException('Execution non trouvee');
    }

    return this.prisma.technicalReport.findMany({
      where: { executionId },
      orderBy: { reportDate: 'desc' },
    });
  }
}
