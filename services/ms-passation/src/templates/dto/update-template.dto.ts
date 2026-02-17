import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'Modele DAO - Marches de Services (v2)' })
  @IsOptional()
  @IsString({ message: 'Le nom doit etre une chaine de caracteres' })
  name?: string;

  @ApiPropertyOptional({ example: 'SERVICES', enum: ['TRAVAUX', 'FOURNITURES', 'SERVICES', 'PRESTATIONS_INTELLECTUELLES'] })
  @IsOptional()
  @IsString({ message: 'Le type de marche doit etre une chaine de caracteres' })
  marketType?: string;

  @ApiPropertyOptional({ example: '/templates/dao_services_v2.docx' })
  @IsOptional()
  @IsString({ message: 'Le chemin du fichier doit etre une chaine de caracteres' })
  filePath?: string;

  @ApiPropertyOptional({ example: 'Version mise a jour du modele' })
  @IsOptional()
  @IsString({ message: 'La description doit etre une chaine de caracteres' })
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'Le champ actif doit etre un booleen' })
  isActive?: boolean;
}
