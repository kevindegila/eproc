import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateArbitrationDto {
  @ApiPropertyOptional({ example: 'appeal-001', description: 'Identifiant du recours lie' })
  @IsOptional()
  @IsString({ message: 'L\'identifiant du recours doit etre une chaine de caracteres' })
  appealId?: string;

  @ApiProperty({ example: ['BTP Plus SARL', 'Ministere de la Sante'], description: 'Parties impliquees' })
  @IsArray({ message: 'Les parties doivent etre un tableau' })
  @IsString({ each: true, message: 'Chaque partie doit etre une chaine de caracteres' })
  parties!: string[];

  @ApiProperty({ example: 'Arbitrage suite au recours gracieux', description: 'Objet de l\'arbitrage' })
  @IsString({ message: 'L\'objet de l\'arbitrage est requis' })
  subject!: string;

  @ApiProperty({ example: 'Description detaillee de l\'arbitrage...', description: 'Description de l\'arbitrage' })
  @IsString({ message: 'La description de l\'arbitrage est requise' })
  description!: string;

  @ApiProperty({ example: 'Me Rodrigue Ahouandjinou', description: 'Arbitre designe' })
  @IsString({ message: 'L\'arbitre est requis' })
  arbitrator!: string;

  @ApiPropertyOptional({ example: '2026-03-01T09:00:00Z', description: 'Date d\'audience' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'audience doit etre une date valide' })
  hearingDate?: string;
}
