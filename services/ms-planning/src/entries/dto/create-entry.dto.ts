import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateEntryDto {
  @ApiProperty({ example: 1, description: 'Numero de ligne dans le plan' })
  @IsInt({ message: 'Le numero de ligne doit etre un entier' })
  @Min(1, { message: 'Le numero de ligne doit etre superieur ou egal a 1' })
  lineNumber!: number;

  @ApiProperty({ example: 'Acquisition de medicaments essentiels', description: 'Description du marche' })
  @IsString({ message: 'La description est requise' })
  description!: string;

  @ApiProperty({ example: 'FOURNITURES', description: 'Type de marche (TRAVAUX, FOURNITURES, SERVICES, PRESTATIONS_INTELLECTUELLES)' })
  @IsString({ message: 'Le type de marche est requis' })
  marketType!: string;

  @ApiProperty({ example: 'APPEL_OFFRES_OUVERT', description: 'Methode de passation' })
  @IsString({ message: 'La methode de passation est requise' })
  method!: string;

  @ApiProperty({ example: 1500000000, description: 'Montant estime en FCFA' })
  @IsNumber({}, { message: 'Le montant estime doit etre un nombre' })
  @Min(0, { message: 'Le montant estime doit etre positif' })
  estimatedAmount!: number;

  @ApiProperty({ example: 1, description: 'Trimestre de lancement prevu (1-4)' })
  @IsInt({ message: 'Le trimestre de lancement doit etre un entier' })
  @Min(1, { message: 'Le trimestre de lancement doit etre entre 1 et 4' })
  @Max(4, { message: 'Le trimestre de lancement doit etre entre 1 et 4' })
  launchQuarter!: number;

  @ApiPropertyOptional({ example: 'Budget National', description: 'Source de financement' })
  @IsOptional()
  @IsString({ message: 'La source de financement doit etre une chaine de caracteres' })
  fundingSource?: string;
}
