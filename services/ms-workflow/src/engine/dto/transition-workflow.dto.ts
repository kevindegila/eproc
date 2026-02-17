import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class TransitionWorkflowDto {
  @ApiProperty({ example: 'VALIDER', description: 'Action déclenchant la transition' })
  @IsString({ message: 'L\'action est requise' })
  action!: string;

  @ApiProperty({ example: 'uuid-de-l-acteur' })
  @IsString({ message: 'L\'identifiant de l\'acteur est requis' })
  actorId!: string;

  @ApiPropertyOptional({ example: 'Approuvé après vérification' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ type: [String], example: ['file1.pdf', 'file2.pdf'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signatureId?: string;

  @ApiPropertyOptional({ description: 'Données contextuelles pour l\'évaluation des gardes' })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ipAddress?: string;
}
