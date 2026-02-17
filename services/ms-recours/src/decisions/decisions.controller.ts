import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';

@ApiTags('Decisions')
@ApiBearerAuth()
@Controller()
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post('decisions')
  @ApiOperation({ summary: 'Enregistrer une decision sur un recours' })
  create(@Body() dto: CreateDecisionDto) {
    return this.decisionsService.create(dto);
  }

  @Get('appeals/:appealId/decisions')
  @ApiOperation({ summary: 'Liste des decisions d\'un recours' })
  findByAppeal(@Param('appealId') appealId: string) {
    return this.decisionsService.findByAppeal(appealId);
  }
}
