import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationSessionDto } from './dto/create-evaluation-session.dto';
import { UpdateEvaluationSessionDto } from './dto/update-evaluation-session.dto';

@ApiTags('Sessions d\'evaluation')
@ApiBearerAuth()
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des sessions d\'evaluation' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dacId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'TECHNIQUE ou FINANCIERE' })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('dacId') dacId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.evaluationsService.findAll({ page, limit, dacId, type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une session d\'evaluation avec ses scores' })
  findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer une session d\'evaluation' })
  create(@Body() dto: CreateEvaluationSessionDto) {
    return this.evaluationsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une session d\'evaluation' })
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationSessionDto) {
    return this.evaluationsService.update(id, dto);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Cloturer une session d\'evaluation' })
  close(@Param('id') id: string) {
    return this.evaluationsService.close(id);
  }
}
