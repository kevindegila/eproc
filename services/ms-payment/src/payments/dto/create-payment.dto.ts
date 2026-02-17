import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'pay-req-001', description: 'Identifiant de la demande de paiement' })
  @IsString({ message: 'L\'identifiant de la demande de paiement est requis' })
  requestId!: string;

  @ApiProperty({ example: 500000000, description: 'Montant du paiement en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount!: number;

  @ApiProperty({ example: '2026-02-10', description: 'Date du paiement' })
  @IsDateString({}, { message: 'La date de paiement doit etre une date valide' })
  paymentDate!: string;

  @ApiProperty({ example: 'VIREMENT_BANCAIRE', description: 'Methode de paiement' })
  @IsString({ message: 'La methode de paiement est requise' })
  paymentMethod!: string;

  @ApiPropertyOptional({ example: 'VIR-TRESOR-2026-00345', description: 'Reference de la transaction' })
  @IsOptional()
  @IsString({ message: 'La reference de transaction doit etre une chaine de caracteres' })
  transactionRef?: string;

  @ApiPropertyOptional({ example: 'Paiement effectue par virement du Tresor Public' })
  @IsOptional()
  @IsString({ message: 'Les observations doivent etre une chaine de caracteres' })
  observations?: string;
}
