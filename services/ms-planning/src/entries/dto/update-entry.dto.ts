import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateEntryDto {
  @ApiPropertyOptional({ example: 1, description: 'Numero de ligne dans le plan' })
  @IsOptional()
  @IsInt({ message: 'Le numero de ligne doit etre un entier' })
  @Min(1, { message: 'Le numero de ligne doit etre superieur ou egal a 1' })
  lineNumber?: number;

  @ApiPropertyOptional({ example: 'Acquisition de medicaments essentiels', description: 'Description du marche' })
  @IsOptional()
  @IsString({ message: 'La description doit etre une chaine de caracteres' })
  description?: string;

  @ApiPropertyOptional({ example: 'FOURNITURES', description: 'Type de marche' })
  @IsOptional()
  @IsString({ message: 'Le type de marche doit etre une chaine de caracteres' })
  marketType?: string;

  @ApiPropertyOptional({ example: 'APPEL_OFFRES_OUVERT', description: 'Methode de passation' })
  @IsOptional()
  @IsString({ message: 'La methode de passation doit etre une chaine de caracteres' })
  method?: string;

  @ApiPropertyOptional({ example: 1500000000, description: 'Montant estime en FCFA' })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant estime doit etre un nombre' })
  @Min(0, { message: 'Le montant estime doit etre positif' })
  estimatedAmount?: number;

  @ApiPropertyOptional({ example: 1, description: 'Trimestre de lancement prevu (1-4)' })
  @IsOptional()
  @IsInt({ message: 'Le trimestre de lancement doit etre un entier' })
  @Min(1, { message: 'Le trimestre de lancement doit etre entre 1 et 4' })
  @Max(4, { message: 'Le trimestre de lancement doit etre entre 1 et 4' })
  launchQuarter?: number;

  @ApiPropertyOptional({ example: 'Budget National', description: 'Source de financement' })
  @IsOptional()
  @IsString({ message: 'La source de financement doit etre une chaine de caracteres' })
  fundingSource?: string;
}
