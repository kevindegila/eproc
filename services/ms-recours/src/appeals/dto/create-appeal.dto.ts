import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateAppealDto {
  @ApiProperty({ example: 'GRACIEUX', description: 'Type de recours (GRACIEUX, HIERARCHIQUE, JURIDICTIONNEL)' })
  @IsString({ message: 'Le type de recours est requis' })
  type!: string;

  @ApiPropertyOptional({ example: 'dac-sante-2026-001', description: 'Identifiant du DAC concerne' })
  @IsOptional()
  @IsString({ message: 'L\'identifiant du DAC doit etre une chaine de caracteres' })
  dacId?: string;

  @ApiPropertyOptional({ example: 'DAC/MS/2026/001', description: 'Reference du DAC concerne' })
  @IsOptional()
  @IsString({ message: 'La reference du DAC doit etre une chaine de caracteres' })
  dacReference?: string;

  @ApiProperty({ example: 'operator-btpplus', description: 'Identifiant du plaignant' })
  @IsString({ message: 'L\'identifiant du plaignant est requis' })
  complainantId!: string;

  @ApiProperty({ example: 'BTP Plus SARL', description: 'Nom du plaignant' })
  @IsString({ message: 'Le nom du plaignant est requis' })
  complainantName!: string;

  @ApiProperty({ example: 'Ministere de la Sante', description: 'Nom de la partie adverse' })
  @IsString({ message: 'Le nom de la partie adverse est requis' })
  respondentName!: string;

  @ApiProperty({ example: 'Contestation de l\'attribution provisoire', description: 'Objet du recours' })
  @IsString({ message: 'L\'objet du recours est requis' })
  subject!: string;

  @ApiProperty({ example: 'Description detaillee du recours...', description: 'Description du recours' })
  @IsString({ message: 'La description du recours est requise' })
  description!: string;
}
