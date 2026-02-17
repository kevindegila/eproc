import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OpeningsService } from './openings.service';
import { CreateOpeningSessionDto } from './dto/create-opening-session.dto';
import { UpdateOpeningSessionDto } from './dto/update-opening-session.dto';

@ApiTags('Sessions d\'ouverture')
@ApiBearerAuth()
@Controller('openings')
export class OpeningsController {
  constructor(private readonly openingsService: OpeningsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des sessions d\'ouverture des plis' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dacId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('dacId') dacId?: string,
    @Query('status') status?: string,
  ) {
    return this.openingsService.findAll({ page, limit, dacId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une session d\'ouverture' })
  findOne(@Param('id') id: string) {
    return this.openingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer une session d\'ouverture des plis' })
  create(@Body() dto: CreateOpeningSessionDto) {
    return this.openingsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une session d\'ouverture' })
  update(@Param('id') id: string, @Body() dto: UpdateOpeningSessionDto) {
    return this.openingsService.update(id, dto);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Cloturer une session d\'ouverture' })
  close(@Param('id') id: string) {
    return this.openingsService.close(id);
  }
}
