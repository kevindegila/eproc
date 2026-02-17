import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsObject, Min } from 'class-validator';

export class UpdateDacDto {
  @ApiPropertyOptional({ example: 'Construction du Centre de Sante de Parakou - Phase 2' })
  @IsOptional()
  @IsString({ message: 'Le titre doit etre une chaine de caracteres' })
  title?: string;

  @ApiPropertyOptional({ example: 'Description mise a jour des travaux' })
  @IsOptional()
  @IsString({ message: 'La description doit etre une chaine de caracteres' })
  description?: string;

  @ApiPropertyOptional({ example: 'TRAVAUX', enum: ['TRAVAUX', 'FOURNITURES', 'SERVICES', 'PRESTATIONS_INTELLECTUELLES'] })
  @IsOptional()
  @IsString({ message: 'Le type de marche doit etre une chaine de caracteres' })
  marketType?: string;

  @ApiPropertyOptional({ example: 'APPEL_OFFRES_OUVERT', enum: ['APPEL_OFFRES_OUVERT', 'APPEL_OFFRES_RESTREINT', 'DEMANDE_COTATION', 'GRE_A_GRE'] })
  @IsOptional()
  @IsString({ message: 'La methode de passation doit etre une chaine de caracteres' })
  procurementMethod?: string;

  @ApiPropertyOptional({ example: 500000000 })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant estime doit etre un nombre' })
  @Min(0, { message: 'Le montant estime doit etre positif' })
  estimatedAmount?: number;

  @ApiPropertyOptional({ example: '2026-04-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de cloture doit etre une date valide' })
  closingDate?: string;

  @ApiPropertyOptional({ description: 'Criteres de qualification et d\'evaluation en JSON' })
  @IsOptional()
  @IsObject({ message: 'Les criteres doivent etre un objet JSON' })
  criteria?: Record<string, unknown>;
}
