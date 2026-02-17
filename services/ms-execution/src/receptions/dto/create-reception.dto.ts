import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateReceptionDto {
  @ApiProperty({ example: 'exec-001', description: 'Identifiant de l\'execution' })
  @IsString({ message: 'L\'identifiant de l\'execution est requis' })
  executionId!: string;

  @ApiProperty({ example: 'PROVISOIRE', description: 'Type de reception (PROVISOIRE, DEFINITIVE)' })
  @IsString({ message: 'Le type de reception est requis' })
  type!: string;

  @ApiProperty({ example: '2026-01-15', description: 'Date de reception' })
  @IsDateString({}, { message: 'La date de reception doit etre une date valide' })
  receptionDate!: string;

  @ApiPropertyOptional({ example: 'PV-RP-2026-001', description: 'Reference du proces-verbal' })
  @IsOptional()
  @IsString()
  pvReference?: string;

  @ApiPropertyOptional({ example: 'Reception sans reserves', description: 'Observations' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({
    example: ['Dr. Codjo Adjahouinou', 'Ing. Grace Tossou'],
    description: 'Membres de la commission de reception',
  })
  @IsOptional()
  @IsArray({ message: 'Les membres doivent etre un tableau' })
  @IsString({ each: true, message: 'Chaque membre doit etre une chaine de caracteres' })
  members?: string[];

  @ApiProperty({ example: 'user-ppm', description: 'Identifiant du createur' })
  @IsString({ message: 'L\'identifiant du createur est requis' })
  createdBy!: string;
}
