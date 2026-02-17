import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';
import { PaymentRequestsService } from './payment-requests.service';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdatePaymentRequestDto } from './dto/update-payment-request.dto';

@ApiTags('Demandes de Paiement')
@ApiBearerAuth()
@Controller('payment-requests')
export class PaymentRequestsController {
  constructor(private readonly paymentRequestsService: PaymentRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des demandes de paiement' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'contractId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('contractId') contractId?: string,
    @Query('search') search?: string,
  ) {
    return this.paymentRequestsService.findAll({ page, limit, status, contractId, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail d\'une demande de paiement' })
  findOne(@Param('id') id: string) {
    return this.paymentRequestsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer une demande de paiement' })
  create(@Body() dto: CreatePaymentRequestDto, @CurrentUser() user: IJwtPayload) {
    return this.paymentRequestsService.create(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Modifier une demande de paiement' })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentRequestDto) {
    return this.paymentRequestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une demande de paiement' })
  remove(@Param('id') id: string) {
    return this.paymentRequestsService.remove(id);
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Soumettre une demande de paiement' })
  submit(@Param('id') id: string) {
    return this.paymentRequestsService.submit(id);
  }

  @Put(':id/validate')
  @ApiOperation({ summary: 'Valider une demande de paiement' })
  validate(@Param('id') id: string) {
    return this.paymentRequestsService.validate(id);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Rejeter une demande de paiement' })
  reject(@Param('id') id: string) {
    return this.paymentRequestsService.reject(id);
  }

  @Put(':id/pay')
  @ApiOperation({ summary: 'Marquer une demande de paiement comme payee' })
  pay(@Param('id') id: string) {
    return this.paymentRequestsService.pay(id);
  }
}
