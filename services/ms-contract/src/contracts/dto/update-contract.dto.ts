import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class UpdateContractDto {
  @ApiPropertyOptional({ example: 'Construction du centre de sante de Parakou - Phase 2' })
  @IsOptional()
  @IsString({ message: 'Le titre doit etre une chaine de caracteres' })
  title?: string;

  @ApiPropertyOptional({ example: 'user-operateur' })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({ example: 'BTP Plus SARL' })
  @IsOptional()
  @IsString()
  operatorName?: string;

  @ApiPropertyOptional({ example: 260000000 })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount?: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de debut doit etre une date valide' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit etre une date valide' })
  endDate?: string;
}
