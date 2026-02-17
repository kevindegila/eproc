import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArbitrationsService } from './arbitrations.service';
import { CreateArbitrationDto } from './dto/create-arbitration.dto';
import { UpdateArbitrationDto } from './dto/update-arbitration.dto';

@ApiTags('Arbitrages')
@ApiBearerAuth()
@Controller('arbitrations')
export class ArbitrationsController {
  constructor(private readonly arbitrationsService: ArbitrationsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des arbitrages' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.arbitrationsService.findAll({ page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un arbitrage' })
  findOne(@Param('id') id: string) {
    return this.arbitrationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un arbitrage' })
  create(@Body() dto: CreateArbitrationDto) {
    return this.arbitrationsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un arbitrage' })
  update(@Param('id') id: string, @Body() dto: UpdateArbitrationDto) {
    return this.arbitrationsService.update(id, dto);
  }

  @Put(':id/decide')
  @ApiOperation({ summary: 'Rendre une decision d\'arbitrage' })
  decide(@Param('id') id: string, @Body('decision') decision: string) {
    return this.arbitrationsService.decide(id, decision);
  }
}
