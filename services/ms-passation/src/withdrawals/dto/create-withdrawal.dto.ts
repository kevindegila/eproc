import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ example: 'BTP Plus SARL' })
  @IsString({ message: 'Le nom de l\'operateur est requis' })
  @IsNotEmpty({ message: 'Le nom de l\'operateur ne peut pas etre vide' })
  operatorName!: string;

  @ApiProperty({ example: 'contact@btpplus.bj' })
  @IsEmail({}, { message: 'L\'adresse email de l\'operateur est invalide' })
  operatorEmail!: string;

  @ApiPropertyOptional({ example: '+229 97 12 34 56' })
  @IsOptional()
  @IsString({ message: 'Le telephone de l\'operateur doit etre une chaine de caracteres' })
  operatorPhone?: string;
}
