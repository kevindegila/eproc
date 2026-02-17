import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, IsString, Min, Max } from 'class-validator';

export class UpdateExecutionDto {
  @ApiPropertyOptional({ example: 65.5, description: 'Pourcentage d\'avancement' })
  @IsOptional()
  @IsNumber({}, { message: 'Le pourcentage d\'avancement doit etre un nombre' })
  @Min(0, { message: 'Le pourcentage d\'avancement doit etre positif' })
  @Max(100, { message: 'Le pourcentage d\'avancement ne peut pas depasser 100' })
  progressPercent?: number;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Date de fin prevue' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin prevue doit etre une date valide' })
  expectedEndDate?: string;

  @ApiPropertyOptional({ example: '2026-11-30', description: 'Date de fin reelle' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin reelle doit etre une date valide' })
  actualEndDate?: string;

  @ApiPropertyOptional({ example: 'Avancement conforme au planning', description: 'Observations' })
  @IsOptional()
  @IsString()
  observations?: string;
}
