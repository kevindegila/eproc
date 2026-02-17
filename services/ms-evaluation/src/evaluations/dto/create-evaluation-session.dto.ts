import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateEvaluationSessionDto {
  @ApiProperty({ example: 'dac-sante-2026-001', description: 'Identifiant du DAC' })
  @IsString({ message: 'L\'identifiant du DAC est requis' })
  dacId!: string;

  @ApiProperty({ example: 'DAC/MS/2026/001', description: 'Reference du DAC' })
  @IsString({ message: 'La reference du DAC est requise' })
  dacReference!: string;

  @ApiPropertyOptional({ example: 'TECHNIQUE', description: 'Type d\'evaluation: TECHNIQUE ou FINANCIERE' })
  @IsOptional()
  @IsIn(['TECHNIQUE', 'FINANCIERE'], { message: 'Le type doit etre TECHNIQUE ou FINANCIERE' })
  type?: string;

  @ApiProperty({ example: '2026-02-20T09:00:00Z', description: 'Date de la session' })
  @IsDateString({}, { message: 'La date de session doit etre une date valide' })
  sessionDate!: string;

  @ApiProperty({ example: 'user-ppm', description: 'Identifiant du createur' })
  @IsString({ message: 'L\'identifiant du createur est requis' })
  createdBy!: string;
}
