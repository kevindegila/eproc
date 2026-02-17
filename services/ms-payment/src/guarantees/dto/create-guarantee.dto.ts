import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateGuaranteeDto {
  @ApiProperty({ example: 'contract-infra-001', description: 'Identifiant du contrat' })
  @IsString({ message: 'L\'identifiant du contrat est requis' })
  contractId!: string;

  @ApiProperty({ example: 'MC-MIT-2026-001', description: 'Reference du contrat' })
  @IsString({ message: 'La reference du contrat est requise' })
  contractReference!: string;

  @ApiProperty({ example: 'BONNE_EXECUTION', description: 'Type de garantie (BONNE_EXECUTION, AVANCE_DEMARRAGE, SOUMISSION, RETENUE_GARANTIE)' })
  @IsString({ message: 'Le type de garantie est requis' })
  type!: string;

  @ApiProperty({ example: 425000000, description: 'Montant de la garantie en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount!: number;

  @ApiProperty({ example: 'Bank of Africa - Benin', description: 'Organisme emetteur de la garantie' })
  @IsString({ message: 'L\'emetteur est requis' })
  issuer!: string;

  @ApiProperty({ example: '2025-12-15', description: 'Date d\'emission de la garantie' })
  @IsDateString({}, { message: 'La date d\'emission doit etre une date valide' })
  issueDate!: string;

  @ApiProperty({ example: '2027-12-15', description: 'Date d\'expiration de la garantie' })
  @IsDateString({}, { message: 'La date d\'expiration doit etre une date valide' })
  expiryDate!: string;
}
