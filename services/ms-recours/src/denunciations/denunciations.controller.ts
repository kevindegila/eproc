import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public } from '@eproc/shared-utils';
import { DenunciationsService } from './denunciations.service';
import { CreateDenunciationDto } from './dto/create-denunciation.dto';
import { UpdateDenunciationDto } from './dto/update-denunciation.dto';

@ApiTags('Denonciations')
@Controller('denunciations')
export class DenunciationsController {
  constructor(private readonly denunciationsService: DenunciationsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liste des denonciations' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.denunciationsService.findAll({ page, limit, status, category });
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detail d\'une denonciation' })
  findOne(@Param('id') id: string) {
    return this.denunciationsService.findOne(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Soumettre une denonciation (accessible sans authentification)' })
  create(@Body() dto: CreateDenunciationDto) {
    return this.denunciationsService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier une denonciation' })
  update(@Param('id') id: string, @Body() dto: UpdateDenunciationDto) {
    return this.denunciationsService.update(id, dto);
  }

  @Put(':id/process')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Traiter une denonciation' })
  process(@Param('id') id: string, @Body('response') response: string) {
    return this.denunciationsService.process(id, response);
  }
}
