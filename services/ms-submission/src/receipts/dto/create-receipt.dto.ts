import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReceiptDto {
  @ApiProperty({ example: 'sub-002', description: 'Identifiant de la soumission' })
  @IsString({ message: 'L\'identifiant de la soumission est requis' })
  @IsNotEmpty({ message: 'L\'identifiant de la soumission ne peut pas etre vide' })
  submissionId!: string;

  @ApiProperty({ example: 'Afi Houessou', description: 'Nom de la personne qui a recu la soumission' })
  @IsString({ message: 'Le nom du receptionnaire est requis' })
  @IsNotEmpty({ message: 'Le nom du receptionnaire ne peut pas etre vide' })
  receivedBy!: string;
}
