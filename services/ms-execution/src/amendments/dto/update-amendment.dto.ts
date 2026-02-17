import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateAmendmentDto {
  @ApiPropertyOptional({ example: 'DELAI', description: 'Type d\'avenant (MONTANT, DELAI, MIXTE, TECHNIQUE)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Modification de la description', description: 'Description de l\'avenant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 25000000, description: 'Variation du montant en FCFA' })
  @IsOptional()
  @IsNumber({}, { message: 'La variation du montant doit etre un nombre' })
  amountChange?: number;

  @ApiPropertyOptional({ example: 90, description: 'Variation du delai en jours' })
  @IsOptional()
  @IsNumber({}, { message: 'La variation du delai doit etre un nombre' })
  durationChange?: number;
}
