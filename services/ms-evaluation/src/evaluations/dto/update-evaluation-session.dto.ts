import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class UpdateEvaluationSessionDto {
  @ApiPropertyOptional({ example: 'TECHNIQUE' })
  @IsOptional()
  @IsIn(['TECHNIQUE', 'FINANCIERE'], { message: 'Le type doit etre TECHNIQUE ou FINANCIERE' })
  type?: string;

  @ApiPropertyOptional({ example: '2026-02-20T09:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de session doit etre une date valide' })
  sessionDate?: string;

  @ApiPropertyOptional({ example: 'EN_COURS' })
  @IsOptional()
  @IsString()
  status?: string;
}
