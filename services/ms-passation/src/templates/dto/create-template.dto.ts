import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Modele DAO - Marches de Services' })
  @IsString({ message: 'Le nom est requis' })
  @IsNotEmpty({ message: 'Le nom ne peut pas etre vide' })
  name!: string;

  @ApiProperty({ example: 'SERVICES', enum: ['TRAVAUX', 'FOURNITURES', 'SERVICES', 'PRESTATIONS_INTELLECTUELLES'] })
  @IsString({ message: 'Le type de marche est requis' })
  @IsNotEmpty({ message: 'Le type de marche ne peut pas etre vide' })
  marketType!: string;

  @ApiProperty({ example: '/templates/dao_services_standard.docx' })
  @IsString({ message: 'Le chemin du fichier est requis' })
  @IsNotEmpty({ message: 'Le chemin du fichier ne peut pas etre vide' })
  filePath!: string;

  @ApiPropertyOptional({ example: 'Modele standard pour les marches de services' })
  @IsOptional()
  @IsString({ message: 'La description doit etre une chaine de caracteres' })
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'Le champ actif doit etre un booleen' })
  isActive?: boolean;
}
