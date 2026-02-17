import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsObject, IsInt, Min } from 'class-validator';

export class CreateDacDto {
  @ApiPropertyOptional({ example: 'AOO/TRAV/2026/010', description: 'Auto-generee si non fournie' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ example: 'Construction du Centre de Sante de Parakou' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Construction du Centre de Sante de Parakou', description: 'Alias pour title' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Travaux de construction et d\'equipement d\'un centre de sante communal' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'org-anac', description: 'Derive du JWT si non fourni' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ example: 'TRAVAUX', enum: ['TRAVAUX', 'FOURNITURES', 'SERVICES', 'PRESTATIONS_INTELLECTUELLES'] })
  @IsString({ message: 'Le type de marche est requis' })
  @IsNotEmpty({ message: 'Le type de marche ne peut pas etre vide' })
  marketType!: string;

  @ApiProperty({ example: 'APPEL_OFFRES_OUVERT', enum: ['APPEL_OFFRES_OUVERT', 'APPEL_OFFRES_RESTREINT', 'DEMANDE_COTATION', 'GRE_A_GRE'] })
  @IsString({ message: 'La methode de passation est requise' })
  @IsNotEmpty({ message: 'La methode de passation ne peut pas etre vide' })
  procurementMethod!: string;

  @ApiPropertyOptional({ example: 450000000 })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant estime doit etre un nombre' })
  @Min(0, { message: 'Le montant estime doit etre positif' })
  estimatedAmount?: number;

  @ApiPropertyOptional({ example: 'BUDGET_NATIONAL' })
  @IsOptional()
  @IsString()
  fundingSource?: string;

  @ApiPropertyOptional({ example: 'PPM-2026-ANAC-001' })
  @IsOptional()
  @IsString()
  ppmReference?: string;

  @ApiPropertyOptional({ example: 12, description: 'Delai d\'execution en mois' })
  @IsOptional()
  @IsInt({ message: 'Le delai d\'execution doit etre un entier' })
  @Min(1, { message: 'Le delai d\'execution doit etre au moins 1 mois' })
  executionDelay?: number;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de cloture doit etre une date valide' })
  closingDate?: string;

  @ApiPropertyOptional({ description: 'Criteres de qualification et d\'evaluation en JSON' })
  @IsOptional()
  @IsObject({ message: 'Les criteres doivent etre un objet JSON' })
  criteria?: Record<string, unknown>;
}
