import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsArray, IsOptional } from 'class-validator';

export class CreateOpeningSessionDto {
  @ApiProperty({ example: 'dac-sante-2026-001', description: 'Identifiant du DAC' })
  @IsString({ message: 'L\'identifiant du DAC est requis' })
  dacId!: string;

  @ApiProperty({ example: 'DAC/MS/2026/001', description: 'Reference du DAC' })
  @IsString({ message: 'La reference du DAC est requise' })
  dacReference!: string;

  @ApiProperty({ example: '2026-02-15T09:00:00Z', description: 'Date de la session' })
  @IsDateString({}, { message: 'La date de session doit etre une date valide' })
  sessionDate!: string;

  @ApiProperty({ example: 'Salle de conference, Cotonou', description: 'Lieu de la session' })
  @IsString({ message: 'Le lieu est requis' })
  location!: string;

  @ApiPropertyOptional({ example: ['Membre 1', 'Membre 2'], description: 'Membres presents' })
  @IsOptional()
  @IsArray({ message: 'Les membres presents doivent etre un tableau' })
  @IsString({ each: true, message: 'Chaque membre doit etre une chaine de caracteres' })
  presentMembers?: string[];

  @ApiPropertyOptional({ example: 'Observations sur la session', description: 'Observations' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ example: 'user-ppm', description: 'Identifiant du createur' })
  @IsString({ message: 'L\'identifiant du createur est requis' })
  createdBy!: string;
}
