import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';
import { PenaltiesService } from './penalties.service';
import { CreatePenaltyDto } from './dto/create-penalty.dto';

@ApiTags('Penalites')
@ApiBearerAuth()
@Controller()
export class PenaltiesController {
  constructor(private readonly penaltiesService: PenaltiesService) {}

  @Get('penalties')
  @ApiOperation({ summary: 'Liste des penalites' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'contractId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('contractId') contractId?: string,
    @Query('type') type?: string,
  ) {
    return this.penaltiesService.findAll({ page, limit, contractId, type });
  }

  @Post('penalties')
  @ApiOperation({ summary: 'Appliquer une penalite' })
  create(@Body() dto: CreatePenaltyDto, @CurrentUser() user: IJwtPayload) {
    return this.penaltiesService.create(dto, user.sub);
  }

  @Get('contracts/:contractId/penalties')
  @ApiOperation({ summary: 'Liste des penalites d\'un contrat' })
  findByContract(@Param('contractId') contractId: string) {
    return this.penaltiesService.findByContract(contractId);
  }

  @Delete('penalties/:id')
  @ApiOperation({ summary: 'Supprimer une penalite' })
  remove(@Param('id') id: string) {
    return this.penaltiesService.remove(id);
  }
}
