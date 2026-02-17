import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateNoticeDto {
  @ApiProperty({ example: 'AGM-MS-2026-001', description: 'Reference unique de l\'avis' })
  @IsString({ message: 'La reference est requise' })
  reference!: string;

  @ApiProperty({ example: 'Avis General de Marches du Ministere de la Sante - Exercice 2026' })
  @IsString({ message: 'Le titre est requis' })
  title!: string;

  @ApiProperty({ example: 'org-ac-sante', description: 'Identifiant de l\'organisation' })
  @IsString({ message: 'L\'identifiant de l\'organisation est requis' })
  organizationId!: string;

  @ApiProperty({ example: 2026, description: 'Annee budgetaire' })
  @IsInt({ message: 'L\'annee budgetaire doit etre un entier' })
  @Min(2020, { message: 'L\'annee budgetaire doit etre superieure ou egale a 2020' })
  @Max(2100, { message: 'L\'annee budgetaire doit etre inferieure ou egale a 2100' })
  fiscalYear!: number;

  @ApiProperty({ example: 'Le Ministere de la Sante informe les operateurs economiques...' })
  @IsString({ message: 'Le contenu de l\'avis est requis' })
  content!: string;
}
