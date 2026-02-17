import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eproc/shared-utils';
import { ExecutionsService } from './executions.service';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';

@ApiTags('Executions')
@ApiBearerAuth()
@Controller('executions')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des executions avec pagination et filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'contractId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('contractId') contractId?: string,
    @Query('status') status?: string,
  ) {
    return this.executionsService.findAll({ page, limit, contractId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une execution' })
  findOne(@Param('id') id: string) {
    return this.executionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer une execution de marche' })
  create(
    @Body() dto: CreateExecutionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.executionsService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une execution' })
  update(@Param('id') id: string, @Body() dto: UpdateExecutionDto) {
    return this.executionsService.update(id, dto);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Demarrer une execution' })
  start(@Param('id') id: string) {
    return this.executionsService.start(id);
  }

  @Put(':id/suspend')
  @ApiOperation({ summary: 'Suspendre une execution' })
  suspend(@Param('id') id: string) {
    return this.executionsService.suspend(id);
  }

  @Put(':id/resume')
  @ApiOperation({ summary: 'Reprendre une execution suspendue' })
  resume(@Param('id') id: string) {
    return this.executionsService.resume(id);
  }
}
