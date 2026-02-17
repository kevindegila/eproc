import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreatePaymentRequestDto {
  @ApiProperty({ example: 'DDP-2026-003', description: 'Reference unique de la demande de paiement' })
  @IsString({ message: 'La reference est requise' })
  reference!: string;

  @ApiProperty({ example: 'contract-infra-001', description: 'Identifiant du contrat' })
  @IsString({ message: 'L\'identifiant du contrat est requis' })
  contractId!: string;

  @ApiProperty({ example: 'MC-MIT-2026-001', description: 'Reference du contrat' })
  @IsString({ message: 'La reference du contrat est requise' })
  contractReference!: string;

  @ApiProperty({ example: 500000000, description: 'Montant de la demande en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount!: number;

  @ApiProperty({ example: 'Paiement de la premiere tranche des travaux' })
  @IsString({ message: 'La description est requise' })
  description!: string;
}
