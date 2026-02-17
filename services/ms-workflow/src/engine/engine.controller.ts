import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EngineService } from './engine.service';
import { StartWorkflowDto } from './dto/start-workflow.dto';
import { TransitionWorkflowDto } from './dto/transition-workflow.dto';

@ApiTags('Moteur de Workflow')
@ApiBearerAuth()
@Controller('workflow-instances')
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @Post()
  @ApiOperation({ summary: 'Démarrer une nouvelle instance de workflow' })
  start(@Body() dto: StartWorkflowDto) {
    return this.engineService.start(dto);
  }

  @Post(':id/transition')
  @ApiOperation({ summary: 'Exécuter une transition sur une instance' })
  transition(@Param('id') id: string, @Body() dto: TransitionWorkflowDto) {
    return this.engineService.transition(id, dto);
  }

  @Put(':id/suspend')
  @ApiOperation({ summary: 'Suspendre une instance de workflow' })
  suspend(
    @Param('id') id: string,
    @Body('actorId') actorId: string,
    @Body('reason') reason?: string,
  ) {
    return this.engineService.suspend(id, actorId, reason);
  }

  @Put(':id/resume')
  @ApiOperation({ summary: 'Reprendre une instance suspendue' })
  resume(@Param('id') id: string, @Body('actorId') actorId: string) {
    return this.engineService.resume(id, actorId);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Annuler une instance de workflow' })
  cancel(
    @Param('id') id: string,
    @Body('actorId') actorId: string,
    @Body('reason') reason?: string,
  ) {
    return this.engineService.cancel(id, actorId, reason);
  }

  @Get('tasks')
  @ApiOperation({ summary: 'File de tâches filtrée par rôle et/ou organisation' })
  @ApiQuery({ name: 'assigneeRole', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'organisationId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findTasks(
    @Query('assigneeRole') assigneeRole?: string,
    @Query('status') status?: string,
    @Query('organisationId') organisationId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.engineService.findTasks({ assigneeRole, status, organisationId, page, limit });
  }

  @Get(':id/state')
  @ApiOperation({ summary: 'État courant d\'une instance avec transitions disponibles' })
  getCurrentState(@Param('id') id: string) {
    return this.engineService.getCurrentState(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Historique complet des événements d\'une instance' })
  getHistory(@Param('id') id: string) {
    return this.engineService.getHistory(id);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Trouver les instances de workflow pour une entité' })
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.engineService.findByEntity(entityType, entityId);
  }
}
