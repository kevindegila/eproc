import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DefinitionsService } from './definitions.service';
import { CreateDefinitionDto } from './dto/create-definition.dto';
import { UpdateDefinitionDto } from './dto/update-definition.dto';

@ApiTags('Définitions de Workflow')
@ApiBearerAuth()
@Controller('workflow-definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des définitions de workflow avec pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'procedureType', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isTemplate', required: false, type: Boolean })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entityType') entityType?: string,
    @Query('procedureType') procedureType?: string,
    @Query('isActive') isActive?: boolean,
    @Query('isTemplate') isTemplate?: boolean,
  ) {
    return this.definitionsService.findAll({
      page,
      limit,
      entityType,
      procedureType,
      isActive,
      isTemplate,
    });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Liste des templates disponibles' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  findTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('entityType') entityType?: string,
  ) {
    return this.definitionsService.findTemplates({ page, limit, entityType });
  }

  @Post('templates/:templateId/override')
  @ApiOperation({ summary: 'Créer un override d\'un template pour une AC' })
  createOverride(
    @Param('templateId') templateId: string,
    @Body('organisationId') organisationId: string,
  ) {
    return this.definitionsService.create({
      templateId,
      organisationId,
      // These won't be used since templateId triggers the override path
      name: '',
      entityType: '',
      yamlContent: '',
    });
  }

  @Get('templates/:templateId/resolve')
  @ApiOperation({ summary: 'Retourne la définition effective (merge template + override)' })
  @ApiQuery({ name: 'organisationId', required: true, type: String })
  async resolveTemplate(
    @Param('templateId') templateId: string,
    @Query('organisationId') organisationId: string,
  ) {
    // Find the override for this template + org, then resolve
    return this.definitionsService.resolveEffective(templateId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'une définition de workflow avec nœuds et transitions' })
  findOne(@Param('id') id: string) {
    return this.definitionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer une définition de workflow à partir de YAML' })
  create(@Body() dto: CreateDefinitionDto) {
    return this.definitionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une définition de workflow' })
  update(@Param('id') id: string, @Body() dto: UpdateDefinitionDto) {
    return this.definitionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une définition de workflow' })
  remove(@Param('id') id: string) {
    return this.definitionsService.remove(id);
  }
}
