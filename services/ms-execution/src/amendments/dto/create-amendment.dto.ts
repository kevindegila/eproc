import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAmendmentDto {
  @ApiProperty({ example: 'exec-001', description: 'Identifiant de l\'execution' })
  @IsString({ message: 'L\'identifiant de l\'execution est requis' })
  executionId!: string;

  @ApiProperty({ example: 'AV-2026-TRAVAUX-0042-02', description: 'Reference unique de l\'avenant' })
  @IsString({ message: 'La reference de l\'avenant est requise' })
  reference!: string;

  @ApiProperty({ example: 'MONTANT', description: 'Type d\'avenant (MONTANT, DELAI, MIXTE, TECHNIQUE)' })
  @IsString({ message: 'Le type d\'avenant est requis' })
  type!: string;

  @ApiProperty({ example: 'Augmentation du montant suite a des travaux supplementaires', description: 'Description de l\'avenant' })
  @IsString({ message: 'La description de l\'avenant est requise' })
  description!: string;

  @ApiPropertyOptional({ example: 15000000, description: 'Variation du montant en FCFA' })
  @IsOptional()
  @IsNumber({}, { message: 'La variation du montant doit etre un nombre' })
  amountChange?: number;

  @ApiPropertyOptional({ example: 60, description: 'Variation du delai en jours' })
  @IsOptional()
  @IsNumber({}, { message: 'La variation du delai doit etre un nombre' })
  durationChange?: number;
}
