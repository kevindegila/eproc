import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class UpdateAwardDto {
  @ApiPropertyOptional({ example: 250000000 })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant ne peut pas etre negatif' })
  awardAmount?: number;

  @ApiPropertyOptional({ example: 'Justification mise a jour' })
  @IsOptional()
  @IsString()
  justification?: string;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'attribution doit etre une date valide' })
  awardDate?: string;

  @ApiPropertyOptional({ example: 'PROVISOIRE' })
  @IsOptional()
  @IsString()
  status?: string;
}
