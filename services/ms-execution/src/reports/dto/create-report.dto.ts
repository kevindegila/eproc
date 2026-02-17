import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 'exec-001', description: 'Identifiant de l\'execution' })
  @IsString({ message: 'L\'identifiant de l\'execution est requis' })
  executionId!: string;

  @ApiProperty({ example: 'Rapport d\'avancement - Phase 2', description: 'Titre du rapport' })
  @IsString({ message: 'Le titre du rapport est requis' })
  title!: string;

  @ApiProperty({ example: '2026-01-15', description: 'Date du rapport' })
  @IsDateString({}, { message: 'La date du rapport doit etre une date valide' })
  reportDate!: string;

  @ApiProperty({ example: 'Description detaillee de l\'avancement des travaux...', description: 'Contenu du rapport' })
  @IsString({ message: 'Le contenu du rapport est requis' })
  content!: string;

  @ApiPropertyOptional({ example: 45.5, description: 'Pourcentage d\'avancement constate' })
  @IsOptional()
  @IsNumber({}, { message: 'Le pourcentage d\'avancement doit etre un nombre' })
  @Min(0, { message: 'Le pourcentage d\'avancement doit etre positif' })
  @Max(100, { message: 'Le pourcentage d\'avancement ne peut pas depasser 100' })
  progressPercent?: number;

  @ApiProperty({ example: 'user-agent-ppm', description: 'Identifiant du createur' })
  @IsString({ message: 'L\'identifiant du createur est requis' })
  createdBy!: string;
}
