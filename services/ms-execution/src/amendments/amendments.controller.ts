import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eproc/shared-utils';
import { AmendmentsService } from './amendments.service';
import { CreateAmendmentDto } from './dto/create-amendment.dto';
import { UpdateAmendmentDto } from './dto/update-amendment.dto';

@ApiTags('Avenants')
@ApiBearerAuth()
@Controller('amendments')
export class AmendmentsController {
  constructor(private readonly amendmentsService: AmendmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des avenants avec pagination et filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'executionId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('executionId') executionId?: string,
    @Query('status') status?: string,
  ) {
    return this.amendmentsService.findAll({ page, limit, executionId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un avenant' })
  findOne(@Param('id') id: string) {
    return this.amendmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un avenant' })
  create(
    @Body() dto: CreateAmendmentDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.amendmentsService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un avenant' })
  update(@Param('id') id: string, @Body() dto: UpdateAmendmentDto) {
    return this.amendmentsService.update(id, dto);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approuver un avenant' })
  approve(@Param('id') id: string) {
    return this.amendmentsService.approve(id);
  }
}
