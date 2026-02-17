import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';

@ApiTags('Rapports Techniques')
@ApiBearerAuth()
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('reports')
  @ApiOperation({ summary: 'Creer un rapport technique' })
  create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto);
  }

  @Get('executions/:executionId/reports')
  @ApiOperation({ summary: 'Liste des rapports techniques d\'une execution' })
  findByExecution(@Param('executionId') executionId: string) {
    return this.reportsService.findByExecution(executionId);
  }
}
