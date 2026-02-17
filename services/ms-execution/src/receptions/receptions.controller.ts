import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceptionsService } from './receptions.service';
import { CreateReceptionDto } from './dto/create-reception.dto';

@ApiTags('Receptions')
@ApiBearerAuth()
@Controller()
export class ReceptionsController {
  constructor(private readonly receptionsService: ReceptionsService) {}

  @Post('receptions')
  @ApiOperation({ summary: 'Creer une reception (provisoire ou definitive)' })
  create(@Body() dto: CreateReceptionDto) {
    return this.receptionsService.create(dto);
  }

  @Get('executions/:executionId/receptions')
  @ApiOperation({ summary: 'Liste des receptions d\'une execution' })
  findByExecution(@Param('executionId') executionId: string) {
    return this.receptionsService.findByExecution(executionId);
  }
}
