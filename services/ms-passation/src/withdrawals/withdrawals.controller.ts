import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@ApiTags('Retraits de dossiers')
@ApiBearerAuth()
@Controller()
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post('dacs/:dacId/withdrawals')
  @ApiOperation({ summary: 'Enregistrer un retrait de dossier pour un DAC' })
  create(
    @Param('dacId') dacId: string,
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.withdrawalsService.create(dacId, dto);
  }

  @Get('dacs/:dacId/withdrawals')
  @ApiOperation({ summary: 'Liste des retraits pour un DAC' })
  findByDac(@Param('dacId') dacId: string) {
    return this.withdrawalsService.findByDac(dacId);
  }
}
