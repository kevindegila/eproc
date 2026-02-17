import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'PPM-MS-2026-001', description: 'Reference unique du plan' })
  @IsString({ message: 'La reference est requise' })
  reference!: string;

  @ApiProperty({ example: 'Plan Previsionnel des Marches - Exercice 2026' })
  @IsString({ message: 'Le titre est requis' })
  title!: string;

  @ApiProperty({ example: 2026, description: 'Annee budgetaire' })
  @IsInt({ message: 'L\'annee budgetaire doit etre un entier' })
  @Min(2020, { message: 'L\'annee budgetaire doit etre superieure ou egale a 2020' })
  @Max(2100, { message: 'L\'annee budgetaire doit etre inferieure ou egale a 2100' })
  fiscalYear!: number;

  @ApiProperty({ example: 'org-ac-sante', description: 'Identifiant de l\'organisation' })
  @IsString({ message: 'L\'identifiant de l\'organisation est requis' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 0, description: 'Montant total previsionnel' })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant total doit etre un nombre' })
  @Min(0, { message: 'Le montant total doit etre positif' })
  totalAmount?: number;
}
