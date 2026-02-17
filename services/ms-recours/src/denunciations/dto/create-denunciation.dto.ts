import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsEmail } from 'class-validator';

export class CreateDenunciationDto {
  @ApiProperty({ example: 'Suspicion de favoritisme dans l\'attribution d\'un marche', description: 'Objet de la denonciation' })
  @IsString({ message: 'L\'objet de la denonciation est requis' })
  subject!: string;

  @ApiProperty({ example: 'Description detaillee des faits denonces...', description: 'Description des faits' })
  @IsString({ message: 'La description des faits est requise' })
  description!: string;

  @ApiProperty({ example: 'FAVORITISME', description: 'Categorie (FAVORITISME, CORRUPTION, IRREGULARITE_PROCEDURE, CONFLIT_INTERET, AUTRE)' })
  @IsString({ message: 'La categorie est requise' })
  category!: string;

  @ApiPropertyOptional({ example: true, description: 'Denonciation anonyme', default: true })
  @IsOptional()
  @IsBoolean({ message: 'L\'anonymat doit etre un booleen' })
  isAnonymous?: boolean;

  @ApiPropertyOptional({ example: 'contact@example.com', description: 'Email de contact (si non anonyme)' })
  @IsOptional()
  @IsEmail({}, { message: 'L\'email de contact doit etre valide' })
  contactEmail?: string;
}
