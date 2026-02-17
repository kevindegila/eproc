import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { UpdateEntryDto } from './dto/update-entry.dto';

@ApiTags('Entrees de Marches')
@ApiBearerAuth()
@Controller()
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get('entries/search')
  @ApiOperation({ summary: 'Rechercher des entrees par reference PPM' })
  @ApiQuery({ name: 'q', required: true, type: String })
  search(@Query('q') q: string) {
    return this.entriesService.searchByReference(q);
  }

  @Get('plans/:planId/entries')
  @ApiOperation({ summary: 'Liste des entrees d\'un plan previsionnel' })
  findAllByPlan(@Param('planId') planId: string) {
    return this.entriesService.findAllByPlan(planId);
  }

  @Post('plans/:planId/entries')
  @ApiOperation({ summary: 'Ajouter une entree a un plan previsionnel' })
  create(@Param('planId') planId: string, @Body() dto: CreateEntryDto) {
    return this.entriesService.create(planId, dto);
  }

  @Put('entries/:id')
  @ApiOperation({ summary: 'Modifier une entree de marche' })
  update(@Param('id') id: string, @Body() dto: UpdateEntryDto) {
    return this.entriesService.update(id, dto);
  }

  @Delete('entries/:id')
  @ApiOperation({ summary: 'Supprimer une entree de marche' })
  remove(@Param('id') id: string) {
    return this.entriesService.remove(id);
  }
}
