import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppealsService } from './appeals.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { UpdateAppealDto } from './dto/update-appeal.dto';

@ApiTags('Recours')
@ApiBearerAuth()
@Controller('appeals')
export class AppealsController {
  constructor(private readonly appealsService: AppealsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des recours' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'complainantId', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('complainantId') complainantId?: string,
  ) {
    return this.appealsService.findAll({ page, limit, type, status, complainantId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un recours' })
  findOne(@Param('id') id: string) {
    return this.appealsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Deposer un recours' })
  create(@Body() dto: CreateAppealDto) {
    return this.appealsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un recours' })
  update(@Param('id') id: string, @Body() dto: UpdateAppealDto) {
    return this.appealsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un recours' })
  remove(@Param('id') id: string) {
    return this.appealsService.remove(id);
  }

  @Put(':id/instruct')
  @ApiOperation({ summary: 'Mettre un recours en instruction' })
  instruct(@Param('id') id: string) {
    return this.appealsService.instruct(id);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Cloturer un recours' })
  close(@Param('id') id: string) {
    return this.appealsService.close(id);
  }
}
