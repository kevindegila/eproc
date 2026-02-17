import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateDenunciationDto {
  @ApiPropertyOptional({ example: 'Objet mis a jour', description: 'Objet de la denonciation' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Description mise a jour', description: 'Description des faits' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'CORRUPTION', description: 'Categorie' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'contact@example.com', description: 'Email de contact' })
  @IsOptional()
  @IsEmail({}, { message: 'L\'email de contact doit etre valide' })
  contactEmail?: string;
}
