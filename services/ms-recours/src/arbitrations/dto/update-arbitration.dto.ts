import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class UpdateArbitrationDto {
  @ApiPropertyOptional({ example: ['Partie A', 'Partie B'], description: 'Parties impliquees' })
  @IsOptional()
  @IsArray({ message: 'Les parties doivent etre un tableau' })
  @IsString({ each: true, message: 'Chaque partie doit etre une chaine de caracteres' })
  parties?: string[];

  @ApiPropertyOptional({ example: 'Objet mis a jour', description: 'Objet de l\'arbitrage' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Description mise a jour', description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Me Nouvel Arbitre', description: 'Arbitre designe' })
  @IsOptional()
  @IsString()
  arbitrator?: string;

  @ApiPropertyOptional({ example: '2026-03-15T09:00:00Z', description: 'Date d\'audience' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'audience doit etre une date valide' })
  hearingDate?: string;
}
