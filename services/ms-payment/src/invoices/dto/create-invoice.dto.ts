import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'pay-req-001', description: 'Identifiant de la demande de paiement' })
  @IsString({ message: 'L\'identifiant de la demande de paiement est requis' })
  requestId!: string;

  @ApiProperty({ example: 'FAC-BTP-2026-0050', description: 'Numero de la facture' })
  @IsString({ message: 'Le numero de facture est requis' })
  invoiceNumber!: string;

  @ApiProperty({ example: 250000000, description: 'Montant de la facture en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount!: number;

  @ApiProperty({ example: '2026-02-01', description: 'Date de la facture' })
  @IsDateString({}, { message: 'La date de facture doit etre une date valide' })
  invoiceDate!: string;

  @ApiPropertyOptional({ example: 'Facture pour les travaux de fondation' })
  @IsOptional()
  @IsString({ message: 'La description doit etre une chaine de caracteres' })
  description?: string;
}
