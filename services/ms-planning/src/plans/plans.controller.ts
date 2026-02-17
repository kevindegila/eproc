import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { CurrentUser, Public } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@ApiTags('Plans Previsionnels')
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Liste des plans previsionnels' })
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
    return this.plansService.findAll({ page, limit, status, organizationId, fiscalYear, search });
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Detail d\'un plan previsionnel' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un plan previsionnel' })
  create(@Body() dto: CreatePlanDto, @CurrentUser() user: IJwtPayload) {
    return this.plansService.create(dto, user.sub);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Importer un PPM depuis un fichier Excel' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
      if (!file.originalname.match(/\.xlsx$/i)) {
        return cb(new BadRequestException('Seuls les fichiers .xlsx sont acceptes'), false);
      }
      cb(null, true);
    },
  }))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('fiscalYear') fiscalYear: string,
    @Body('organizationName') organizationName: string,
    @CurrentUser() user: IJwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('Le fichier est requis');
    }
    const orgId = user.organizationId;
    if (!orgId) {
      throw new BadRequestException('Utilisateur non rattache a une organisation');
    }
    const year = fiscalYear ? parseInt(fiscalYear, 10) : new Date().getFullYear();
    return this.plansService.uploadPlan(file, year, orgId, user.sub, organizationName);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier un plan previsionnel' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un plan previsionnel' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Soumettre un plan previsionnel pour validation' })
  submit(@Param('id') id: string) {
    return this.plansService.submit(id);
  }

  @Put(':id/validate')
  @ApiOperation({ summary: 'Valider un plan previsionnel' })
  validate(@Param('id') id: string) {
    return this.plansService.validate(id);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publier un plan previsionnel' })
  publish(@Param('id') id: string) {
    return this.plansService.publish(id);
  }
}
