import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateDecisionDto {
  @ApiProperty({ example: 'appeal-001', description: 'Identifiant du recours' })
  @IsString({ message: 'L\'identifiant du recours est requis' })
  appealId!: string;

  @ApiProperty({ example: '2026-02-10T00:00:00Z', description: 'Date de la decision' })
  @IsDateString({}, { message: 'La date de decision doit etre une date valide' })
  decisionDate!: string;

  @ApiProperty({ example: 'AVIS_ARMP', description: 'Type de decision (AVIS_ARMP, DECISION_CRD, JUGEMENT)' })
  @IsString({ message: 'Le type de decision est requis' })
  decisionType!: string;

  @ApiProperty({ example: 'Resume de la decision rendue...', description: 'Resume de la decision' })
  @IsString({ message: 'Le resume de la decision est requis' })
  summary!: string;

  @ApiProperty({ example: true, description: 'Decision en faveur du plaignant' })
  @IsBoolean({ message: 'L\'indication de faveur doit etre un booleen' })
  isInFavor!: boolean;

  @ApiProperty({ example: 'Comite de Reglement des Differends - ARMP', description: 'Organe/personne ayant rendu la decision' })
  @IsString({ message: 'L\'identite du decideur est requise' })
  decidedBy!: string;
}
