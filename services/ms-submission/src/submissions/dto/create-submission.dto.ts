import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'dac-2026-001', description: 'Identifiant du DAC' })
  @IsString({ message: 'L\'identifiant du DAC est requis' })
  @IsNotEmpty({ message: 'L\'identifiant du DAC ne peut pas etre vide' })
  dacId!: string;

  @ApiProperty({ example: 'DAC/MS/2026/AOO/001', description: 'Reference du DAC' })
  @IsString({ message: 'La reference du DAC est requise' })
  @IsNotEmpty({ message: 'La reference du DAC ne peut pas etre vide' })
  dacReference!: string;

  @ApiProperty({ example: 'user-operateur', description: 'Identifiant de l\'operateur economique' })
  @IsString({ message: 'L\'identifiant de l\'operateur est requis' })
  @IsNotEmpty({ message: 'L\'identifiant de l\'operateur ne peut pas etre vide' })
  operatorId!: string;

  @ApiProperty({ example: 'BTP Plus SARL', description: 'Nom de l\'operateur economique' })
  @IsString({ message: 'Le nom de l\'operateur est requis' })
  @IsNotEmpty({ message: 'Le nom de l\'operateur ne peut pas etre vide' })
  operatorName!: string;
}
