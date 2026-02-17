import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GuaranteesService } from './guarantees.service';
import { CreateGuaranteeDto } from './dto/create-guarantee.dto';
import { UpdateGuaranteeDto } from './dto/update-guarantee.dto';

@ApiTags('Garanties')
@ApiBearerAuth()
@Controller()
export class GuaranteesController {
  constructor(private readonly guaranteesService: GuaranteesService) {}

  @Get('guarantees')
  @ApiOperation({ summary: 'Liste des garanties' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'contractId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('contractId') contractId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.guaranteesService.findAll({ page, limit, contractId, type, status });
  }

  @Get('guarantees/:id')
  @ApiOperation({ summary: 'Detail d\'une garantie' })
  findOne(@Param('id') id: string) {
    return this.guaranteesService.findOne(id);
  }

  @Post('guarantees')
  @ApiOperation({ summary: 'Creer une garantie' })
  create(@Body() dto: CreateGuaranteeDto) {
    return this.guaranteesService.create(dto);
  }

  @Put('guarantees/:id')
  @ApiOperation({ summary: 'Modifier une garantie' })
  update(@Param('id') id: string, @Body() dto: UpdateGuaranteeDto) {
    return this.guaranteesService.update(id, dto);
  }

  @Get('contracts/:contractId/guarantees')
  @ApiOperation({ summary: 'Liste des garanties d\'un contrat' })
  findByContract(@Param('contractId') contractId: string) {
    return this.guaranteesService.findByContract(contractId);
  }

  @Put('guarantees/:id/release')
  @ApiOperation({ summary: 'Liberer une garantie' })
  release(@Param('id') id: string) {
    return this.guaranteesService.release(id);
  }
}
