import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('Factures')
@ApiBearerAuth()
@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('invoices')
  @ApiOperation({ summary: 'Creer une facture' })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get('requests/:requestId/invoices')
  @ApiOperation({ summary: 'Liste des factures d\'une demande de paiement' })
  findByRequest(@Param('requestId') requestId: string) {
    return this.invoicesService.findByRequest(requestId);
  }
}
