import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Paiements')
@ApiBearerAuth()
@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payments')
  @ApiOperation({ summary: 'Enregistrer un paiement' })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get('requests/:requestId/payments')
  @ApiOperation({ summary: 'Liste des paiements d\'une demande de paiement' })
  findByRequest(@Param('requestId') requestId: string) {
    return this.paymentsService.findByRequest(requestId);
  }
}
