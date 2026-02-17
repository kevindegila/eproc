import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LockRuleDto {
  lock_when_role_in!: string[];
}

export class CreateDefinitionDto {
  @ApiProperty({ example: 'Workflow Appel d\'Offres Ouvert' })
  @IsString({ message: 'Le nom est requis' })
  name!: string;

  @ApiProperty({ example: 'DAC' })
  @IsString({ message: 'Le type d\'entité est requis' })
  entityType!: string;

  @ApiPropertyOptional({ example: 'APPEL_OFFRES_OUVERT' })
  @IsOptional()
  @IsString()
  procedureType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organisationId?: string;

  @ApiPropertyOptional({ description: 'ID du template parent pour créer un override' })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Règle de verrouillage des noeuds (pour les templates)',
    example: { lock_when_role_in: ['DNCMP', 'ARMP', 'AGENT_ARMP', 'OPERATEUR_ECONOMIQUE'] },
  })
  @IsOptional()
  @IsObject()
  lockRule?: LockRuleDto;

  @ApiProperty({
    description: 'Contenu YAML décrivant les nœuds et transitions du workflow',
    example: `nodes:
  - code: START
    label: Début
    type: START
    mandatory: true
  - code: REDACTION_DAO
    label: Rédaction du DAO
    type: ACTION
    assignee_role: AGENT_PPM
    sla_hours: 48
    mandatory: true
  - code: END
    label: Fin
    type: END
transitions:
  - from: START
    to: REDACTION_DAO
    action: DEMARRER
    label: Démarrer
  - from: REDACTION_DAO
    to: END
    action: VALIDER
    label: Valider`,
  })
  @IsString({ message: 'Le contenu YAML est requis' })
  yamlContent!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
