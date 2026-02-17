import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';

@ApiTags('Soumissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des soumissions avec pagination et filtres' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'dacId', required: false, type: String })
  @ApiQuery({ name: 'operatorId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('dacId') dacId?: string,
    @Query('operatorId') operatorId?: string,
    @Query('status') status?: string,
  ) {
    return this.submissionsService.findAll({ page, limit, dacId, operatorId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une soumission' })
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer une soumission' })
  create(@Body() dto: CreateSubmissionDto) {
    return this.submissionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une soumission' })
  update(@Param('id') id: string, @Body() dto: UpdateSubmissionDto) {
    return this.submissionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une soumission' })
  remove(@Param('id') id: string) {
    return this.submissionsService.remove(id);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Deposer une soumission (passage au statut SOUMISE)' })
  submit(@Param('id') id: string) {
    return this.submissionsService.submit(id);
  }

  @Put(':id/withdraw')
  @ApiOperation({ summary: 'Retirer une soumission (passage au statut RETIREE)' })
  withdraw(@Param('id') id: string) {
    return this.submissionsService.withdraw(id);
  }
}
