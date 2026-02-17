import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class UpdateGuaranteeDto {
  @ApiPropertyOptional({ example: 500000000, description: 'Montant de la garantie en FCFA' })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount?: number;

  @ApiPropertyOptional({ example: 'Ecobank Benin', description: 'Organisme emetteur de la garantie' })
  @IsOptional()
  @IsString({ message: 'L\'emetteur doit etre une chaine de caracteres' })
  issuer?: string;

  @ApiPropertyOptional({ example: '2028-06-30', description: 'Date d\'expiration de la garantie' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'expiration doit etre une date valide' })
  expiryDate?: string;
}
