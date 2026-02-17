import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSignatureDto {
  @ApiProperty({ example: 'contract-002', description: 'Identifiant du contrat' })
  @IsString({ message: 'L\'identifiant du contrat est requis' })
  @IsNotEmpty({ message: 'L\'identifiant du contrat ne peut pas etre vide' })
  contractId!: string;

  @ApiProperty({ example: 'Codjo Adjahouinou', description: 'Nom du signataire' })
  @IsString({ message: 'Le nom du signataire est requis' })
  @IsNotEmpty({ message: 'Le nom du signataire ne peut pas etre vide' })
  signerName!: string;

  @ApiProperty({ example: 'Personne Responsable des Marches Publics', description: 'Role du signataire' })
  @IsString({ message: 'Le role du signataire est requis' })
  @IsNotEmpty({ message: 'Le role du signataire ne peut pas etre vide' })
  signerRole!: string;

  @ApiPropertyOptional({ example: 'Contrat conforme au dossier de consultation', description: 'Observations du signataire' })
  @IsOptional()
  @IsString({ message: 'Les observations doivent etre une chaine de caracteres' })
  observations?: string;
}
