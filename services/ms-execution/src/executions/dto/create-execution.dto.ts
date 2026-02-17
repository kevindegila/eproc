import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class CreateExecutionDto {
  @ApiProperty({ example: 'contract-001', description: 'Identifiant du contrat' })
  @IsString({ message: 'L\'identifiant du contrat est requis' })
  contractId!: string;

  @ApiProperty({ example: 'MC-2025-TRAVAUX-0042', description: 'Reference du contrat' })
  @IsString({ message: 'La reference du contrat est requise' })
  contractReference!: string;

  @ApiPropertyOptional({ example: 0, description: 'Pourcentage d\'avancement initial' })
  @IsOptional()
  @IsNumber({}, { message: 'Le pourcentage d\'avancement doit etre un nombre' })
  @Min(0, { message: 'Le pourcentage d\'avancement doit etre positif' })
  @Max(100, { message: 'Le pourcentage d\'avancement ne peut pas depasser 100' })
  progressPercent?: number;

  @ApiPropertyOptional({ example: '2025-06-15', description: 'Date de debut prevue' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de debut doit etre une date valide' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Date de fin prevue' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin prevue doit etre une date valide' })
  expectedEndDate?: string;

  @ApiPropertyOptional({ example: 'Marche de travaux routiers', description: 'Observations' })
  @IsOptional()
  @IsString()
  observations?: string;
}
