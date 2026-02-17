import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class UpdateNoticeDto {
  @ApiPropertyOptional({ example: 'Avis General de Marches - Exercice 2026' })
  @IsOptional()
  @IsString({ message: 'Le titre doit etre une chaine de caracteres' })
  title?: string;

  @ApiPropertyOptional({ example: 'org-ac-sante', description: 'Identifiant de l\'organisation' })
  @IsOptional()
  @IsString({ message: 'L\'identifiant de l\'organisation doit etre une chaine de caracteres' })
  organizationId?: string;

  @ApiPropertyOptional({ example: 2026, description: 'Annee budgetaire' })
  @IsOptional()
  @IsInt({ message: 'L\'annee budgetaire doit etre un entier' })
  @Min(2020, { message: 'L\'annee budgetaire doit etre superieure ou egale a 2020' })
  @Max(2100, { message: 'L\'annee budgetaire doit etre inferieure ou egale a 2100' })
  fiscalYear?: number;

  @ApiPropertyOptional({ example: 'Le Ministere informe les operateurs economiques...' })
  @IsOptional()
  @IsString({ message: 'Le contenu doit etre une chaine de caracteres' })
  content?: string;
}
