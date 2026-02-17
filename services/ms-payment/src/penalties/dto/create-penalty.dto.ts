import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePenaltyDto {
  @ApiProperty({ example: 'contract-infra-002', description: 'Identifiant du contrat' })
  @IsString({ message: 'L\'identifiant du contrat est requis' })
  contractId!: string;

  @ApiProperty({ example: 'MC-MIT-2026-005', description: 'Reference du contrat' })
  @IsString({ message: 'La reference du contrat est requise' })
  contractReference!: string;

  @ApiProperty({ example: 'RETARD', description: 'Type de penalite (RETARD, MALFACON, NON_CONFORMITE)' })
  @IsString({ message: 'Le type de penalite est requis' })
  type!: string;

  @ApiProperty({ example: 12500000, description: 'Montant de la penalite en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount!: number;

  @ApiProperty({ example: 'Penalite de retard de 15 jours - 1/1000eme du montant par jour' })
  @IsString({ message: 'Le motif est requis' })
  reason!: string;

  @ApiProperty({ example: '2026-01-20', description: 'Date d\'application de la penalite' })
  @IsDateString({}, { message: 'La date d\'application doit etre une date valide' })
  appliedDate!: string;
}
