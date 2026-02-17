import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateAwardDto {
  @ApiProperty({ example: 'dac-sante-2026-001', description: 'Identifiant du DAC' })
  @IsString({ message: 'L\'identifiant du DAC est requis' })
  dacId!: string;

  @ApiProperty({ example: 'DAC/MS/2026/001', description: 'Reference du DAC' })
  @IsString({ message: 'La reference du DAC est requise' })
  dacReference!: string;

  @ApiProperty({ example: 'submission-btpplus-001', description: 'Identifiant de la soumission' })
  @IsString({ message: 'L\'identifiant de la soumission est requis' })
  submissionId!: string;

  @ApiProperty({ example: 'BTP Plus SARL', description: 'Nom de l\'operateur economique' })
  @IsString({ message: 'Le nom de l\'operateur est requis' })
  operatorName!: string;

  @ApiProperty({ example: 245000000, description: 'Montant de l\'attribution en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant ne peut pas etre negatif' })
  awardAmount!: number;

  @ApiProperty({ example: 'Offre la mieux-disante', description: 'Justification de l\'attribution' })
  @IsString({ message: 'La justification est requise' })
  justification!: string;

  @ApiProperty({ example: '2026-02-28T00:00:00Z', description: 'Date de l\'attribution' })
  @IsDateString({}, { message: 'La date d\'attribution doit etre une date valide' })
  awardDate!: string;

  @ApiProperty({ example: 'user-ppm', description: 'Identifiant du createur' })
  @IsString({ message: 'L\'identifiant du createur est requis' })
  createdBy!: string;
}
