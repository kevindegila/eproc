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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { CurrentUser } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';

@ApiTags('Contrats')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des contrats avec pagination et filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filtrer par statut' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, description: 'Filtrer par organisation' })
  @ApiQuery({ name: 'operatorId', required: false, type: String, description: 'Filtrer par operateur' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par reference, titre, operateur ou DAC' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('organizationId') organizationId?: string,
    @Query('operatorId') operatorId?: string,
    @Query('search') search?: string,
  ) {
    return this.contractsService.findAll({ page, limit, status, organizationId, operatorId, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'un contrat' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un nouveau contrat' })
  create(@Body() dto: CreateContractDto, @CurrentUser() user: IJwtPayload) {
    return this.contractsService.create(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un contrat (statut BROUILLON uniquement)' })
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un contrat (statut BROUILLON uniquement)' })
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }

  @Put(':id/sign')
  @ApiOperation({ summary: 'Envoyer le contrat en signature (BROUILLON -> EN_SIGNATURE)' })
  sign(@Param('id') id: string) {
    return this.contractsService.sign(id);
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approuver le contrat (SIGNE -> APPROUVE)' })
  approve(@Param('id') id: string) {
    return this.contractsService.approve(id);
  }

  @Put(':id/notify')
  @ApiOperation({ summary: 'Notifier le contrat (APPROUVE -> NOTIFIE)' })
  notify(@Param('id') id: string) {
    return this.contractsService.notify(id);
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Demarrer l\'execution du contrat (NOTIFIE -> EN_COURS)' })
  start(@Param('id') id: string) {
    return this.contractsService.start(id);
  }

  @Put(':id/terminate')
  @ApiOperation({ summary: 'Terminer le contrat (EN_COURS -> TERMINE)' })
  terminate(@Param('id') id: string) {
    return this.contractsService.terminate(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Resilier le contrat (tout statut sauf TERMINE/RESILIE -> RESILIE)' })
  cancel(@Param('id') id: string) {
    return this.contractsService.cancel(id);
  }
}
