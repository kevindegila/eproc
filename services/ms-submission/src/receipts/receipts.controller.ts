import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';

@ApiTags('Accuses de reception')
@ApiBearerAuth()
@Controller()
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post('receipts')
  @ApiOperation({ summary: 'Creer un accuse de reception pour une soumission' })
  create(@Body() dto: CreateReceiptDto) {
    return this.receiptsService.create(dto);
  }

  @Get('submissions/:submissionId/receipt')
  @ApiOperation({ summary: 'Accuse de reception d\'une soumission' })
  findBySubmission(@Param('submissionId') submissionId: string) {
    return this.receiptsService.findBySubmission(submissionId);
  }
}
