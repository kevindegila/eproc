import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateScoreDto {
  @ApiProperty({ example: 'eval-session-tech-1', description: 'Identifiant de la session d\'evaluation' })
  @IsString({ message: 'L\'identifiant de la session est requis' })
  sessionId!: string;

  @ApiProperty({ example: 'submission-btpplus-001', description: 'Identifiant de la soumission' })
  @IsString({ message: 'L\'identifiant de la soumission est requis' })
  submissionId!: string;

  @ApiProperty({ example: 'BTP Plus SARL', description: 'Nom de l\'operateur economique' })
  @IsString({ message: 'Le nom de l\'operateur est requis' })
  operatorName!: string;

  @ApiProperty({ example: 'Experience generale', description: 'Critere d\'evaluation' })
  @IsString({ message: 'Le critere est requis' })
  criterion!: string;

  @ApiProperty({ example: 18, description: 'Score attribue' })
  @IsNumber({}, { message: 'Le score doit etre un nombre' })
  @Min(0, { message: 'Le score ne peut pas etre negatif' })
  score!: number;

  @ApiProperty({ example: 20, description: 'Score maximum possible' })
  @IsNumber({}, { message: 'Le score maximum doit etre un nombre' })
  @Min(0, { message: 'Le score maximum ne peut pas etre negatif' })
  maxScore!: number;

  @ApiPropertyOptional({ example: 'Bonne experience', description: 'Observations' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({ example: 'user-membre', description: 'Identifiant de l\'evaluateur' })
  @IsString({ message: 'L\'identifiant de l\'evaluateur est requis' })
  evaluatedBy!: string;
}
