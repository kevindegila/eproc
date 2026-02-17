import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrossWorkflowService } from './cross-workflow.service';

@ApiTags('Workflows Inter-liés')
@ApiBearerAuth()
@Controller('workflow-cross')
export class CrossWorkflowController {
  constructor(private readonly crossWorkflowService: CrossWorkflowService) {}

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Tous les workflows liés à une entité' })
  getEntityWorkflows(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.crossWorkflowService.getEntityWorkflows(entityType, entityId);
  }

  @Put('entity/:entityType/:entityId/suspend')
  @ApiOperation({ summary: 'Suspendre tous les workflows actifs d\'une entité' })
  suspendByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('actorId') actorId: string,
    @Body('reason') reason?: string,
  ) {
    return this.crossWorkflowService.suspendByEntity(entityType, entityId, actorId, reason);
  }

  @Put('entity/:entityType/:entityId/resume')
  @ApiOperation({ summary: 'Reprendre tous les workflows suspendus d\'une entité' })
  resumeByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('actorId') actorId: string,
  ) {
    return this.crossWorkflowService.resumeByEntity(entityType, entityId, actorId);
  }

  @Put('entity/:entityType/:entityId/cancel')
  @ApiOperation({ summary: 'Annuler tous les workflows d\'une entité' })
  cancelByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('actorId') actorId: string,
    @Body('reason') reason?: string,
  ) {
    return this.crossWorkflowService.cancelByEntity(entityType, entityId, actorId, reason);
  }

  @Post('cascade/:parentInstanceId')
  @ApiOperation({ summary: 'Démarrer un workflow enfant après complétion d\'un parent' })
  cascadeStart(
    @Param('parentInstanceId') parentInstanceId: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('actorId') actorId: string,
    @Body('procedureType') procedureType?: string,
    @Body('context') context?: Record<string, unknown>,
  ) {
    return this.crossWorkflowService.cascadeStart(
      parentInstanceId,
      entityType,
      entityId,
      actorId,
      procedureType,
      context,
    );
  }
}
