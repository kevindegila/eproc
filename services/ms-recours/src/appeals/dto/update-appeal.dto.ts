import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAppealDto {
  @ApiPropertyOptional({ example: 'GRACIEUX', description: 'Type de recours' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'dac-sante-2026-001', description: 'Identifiant du DAC' })
  @IsOptional()
  @IsString()
  dacId?: string;

  @ApiPropertyOptional({ example: 'DAC/MS/2026/001', description: 'Reference du DAC' })
  @IsOptional()
  @IsString()
  dacReference?: string;

  @ApiPropertyOptional({ example: 'Objet mis a jour', description: 'Objet du recours' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'Description mise a jour', description: 'Description du recours' })
  @IsOptional()
  @IsString()
  description?: string;
}
