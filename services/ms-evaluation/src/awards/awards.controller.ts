import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AwardsService } from './awards.service';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';

@ApiTags('Attributions provisoires')
@ApiBearerAuth()
@Controller('awards')
export class AwardsController {
  constructor(private readonly awardsService: AwardsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des attributions provisoires' })
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
    return this.awardsService.findAll({ page, limit, dacId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une attribution provisoire' })
  findOne(@Param('id') id: string) {
    return this.awardsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer une attribution provisoire' })
  create(@Body() dto: CreateAwardDto) {
    return this.awardsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une attribution provisoire' })
  update(@Param('id') id: string, @Body() dto: UpdateAwardDto) {
    return this.awardsService.update(id, dto);
  }

  @Put(':id/confirm')
  @ApiOperation({ summary: 'Confirmer une attribution (statut DEFINITIF)' })
  confirm(@Param('id') id: string) {
    return this.awardsService.confirm(id);
  }
}
