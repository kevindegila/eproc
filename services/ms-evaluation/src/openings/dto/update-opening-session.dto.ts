import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class UpdateOpeningSessionDto {
  @ApiPropertyOptional({ example: '2026-02-15T09:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de session doit etre une date valide' })
  sessionDate?: string;

  @ApiPropertyOptional({ example: 'Salle de conference, Cotonou' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'EN_COURS' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: ['Membre 1', 'Membre 2'] })
  @IsOptional()
  @IsArray({ message: 'Les membres presents doivent etre un tableau' })
  @IsString({ each: true, message: 'Chaque membre doit etre une chaine de caracteres' })
  presentMembers?: string[];

  @ApiPropertyOptional({ example: 'Observations mises a jour' })
  @IsOptional()
  @IsString()
  observations?: string;
}
