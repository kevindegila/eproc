import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class StartWorkflowDto {
  @ApiProperty({ example: 'DAC', description: 'Type d\'entité (DAC, CONTRAT, PLAN, etc.)' })
  @IsString({ message: 'Le type d\'entité est requis' })
  entityType!: string;

  @ApiProperty({ example: 'uuid-de-l-entite' })
  @IsString({ message: 'L\'identifiant de l\'entité est requis' })
  entityId!: string;

  @ApiPropertyOptional({ description: 'ID d\'une définition spécifique. Si absent, la définition active sera utilisée.' })
  @IsOptional()
  @IsString()
  definitionId?: string;

  @ApiPropertyOptional({ example: 'APPEL_OFFRES_OUVERT' })
  @IsOptional()
  @IsString()
  procedureType?: string;

  @ApiPropertyOptional({ description: 'ID de l\'organisation (AC) pour résoudre la bonne définition' })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @ApiPropertyOptional({ description: 'Contexte initial du workflow (montant, type, etc.)' })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;

  @ApiProperty({ example: 'uuid-de-l-acteur' })
  @IsString({ message: 'L\'identifiant de l\'acteur est requis' })
  actorId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
