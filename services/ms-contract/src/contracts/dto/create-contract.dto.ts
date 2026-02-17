import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsNotEmpty, Min } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ example: 'CTR-2026-0010', description: 'Reference unique du contrat' })
  @IsString({ message: 'La reference est requise' })
  @IsNotEmpty({ message: 'La reference ne peut pas etre vide' })
  reference!: string;

  @ApiProperty({ example: 'dac-001', description: 'Identifiant du DAC' })
  @IsString({ message: 'L\'identifiant du DAC est requis' })
  @IsNotEmpty({ message: 'L\'identifiant du DAC ne peut pas etre vide' })
  dacId!: string;

  @ApiProperty({ example: 'DAC-2026-0042', description: 'Reference du DAC' })
  @IsString({ message: 'La reference du DAC est requise' })
  @IsNotEmpty({ message: 'La reference du DAC ne peut pas etre vide' })
  dacReference!: string;

  @ApiProperty({ example: 'Construction du centre de sante de Parakou', description: 'Titre du contrat' })
  @IsString({ message: 'Le titre est requis' })
  @IsNotEmpty({ message: 'Le titre ne peut pas etre vide' })
  title!: string;

  @ApiProperty({ example: 'user-operateur', description: 'Identifiant de l\'operateur economique' })
  @IsString({ message: 'L\'identifiant de l\'operateur est requis' })
  @IsNotEmpty({ message: 'L\'identifiant de l\'operateur ne peut pas etre vide' })
  operatorId!: string;

  @ApiProperty({ example: 'BTP Plus SARL', description: 'Nom de l\'operateur economique' })
  @IsString({ message: 'Le nom de l\'operateur est requis' })
  @IsNotEmpty({ message: 'Le nom de l\'operateur ne peut pas etre vide' })
  operatorName!: string;

  @ApiProperty({ example: 'org-ac-sante', description: 'Identifiant de l\'organisation' })
  @IsString({ message: 'L\'identifiant de l\'organisation est requis' })
  @IsNotEmpty({ message: 'L\'identifiant de l\'organisation ne peut pas etre vide' })
  organizationId!: string;

  @ApiProperty({ example: 245000000, description: 'Montant du contrat en FCFA' })
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount!: number;

  @ApiPropertyOptional({ example: '2026-04-01', description: 'Date de debut du contrat' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de debut doit etre une date valide' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31', description: 'Date de fin du contrat' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de fin doit etre une date valide' })
  endDate?: string;
}
