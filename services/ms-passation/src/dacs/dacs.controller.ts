import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Public, CurrentUser } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';
import { DacsService } from './dacs.service';
import { CreateDacDto } from './dto/create-dac.dto';
import { UpdateDacDto } from './dto/update-dac.dto';

@ApiTags('DAC - Dossiers d\'Appel a Concurrence')
@ApiBearerAuth()
@Controller('dacs')
export class DacsController {
  constructor(private readonly dacsService: DacsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste des DAC avec pagination et filtres (acces public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'marketType', required: false, type: String })
  @ApiQuery({ name: 'organizationId', required: false, type: String })
  @ApiQuery({ name: 'publicOnly', required: false, type: Boolean, description: 'Si true, retourne uniquement les DAC publies (acces public)' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('marketType') marketType?: string,
    @Query('organizationId') organizationId?: string,
    @Query('publicOnly') publicOnly?: boolean,
  ) {
    return this.dacsService.findAll({
      page,
      limit,
      search,
      status,
      marketType,
      organizationId,
      publicOnly,
    });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Detail d\'un DAC (acces public)' })
  findOne(@Param('id') id: string) {
    return this.dacsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un nouveau DAC' })
  create(
    @Body() dto: CreateDacDto,
    @CurrentUser() user: IJwtPayload,
  ) {
    return this.dacsService.create(dto, user.sub, user.organizationId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un DAC (statut BROUILLON uniquement)' })
  update(@Param('id') id: string, @Body() dto: UpdateDacDto) {
    return this.dacsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un DAC (statut BROUILLON uniquement)' })
  remove(@Param('id') id: string) {
    return this.dacsService.remove(id);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Soumettre un DAC pour validation DNCMP (BROUILLON -> SOUMIS)' })
  submit(@Param('id') id: string) {
    return this.dacsService.submit(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publier un DAC (BROUILLON -> PUBLIE)' })
  publish(@Param('id') id: string) {
    return this.dacsService.publish(id);
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Cloturer un DAC (PUBLIE -> CLOTURE)' })
  close(@Param('id') id: string) {
    return this.dacsService.close(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Annuler un DAC' })
  cancel(@Param('id') id: string) {
    return this.dacsService.cancel(id);
  }
}
