import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, CurrentUser } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@ApiTags('Avis Generaux')
@ApiBearerAuth()
@Controller('notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste des avis generaux (acces public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'fiscalYear', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('organizationId') organizationId?: string,
    @Query('fiscalYear') fiscalYear?: number,
    @Query('search') search?: string,
  ) {
    return this.noticesService.findAll({ page, limit, status, organizationId, fiscalYear, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un avis general' })
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un avis general' })
  create(@Body() dto: CreateNoticeDto, @CurrentUser() user: IJwtPayload) {
    return this.noticesService.create(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un avis general' })
  update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un avis general' })
  remove(@Param('id') id: string) {
    return this.noticesService.remove(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publier un avis general' })
  publish(@Param('id') id: string) {
    return this.noticesService.publish(id);
  }
}
