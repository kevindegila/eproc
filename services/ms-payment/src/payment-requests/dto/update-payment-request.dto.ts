import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdatePaymentRequestDto {
  @ApiPropertyOptional({ example: 600000000, description: 'Montant de la demande en FCFA' })
  @IsOptional()
  @IsNumber({}, { message: 'Le montant doit etre un nombre' })
  @Min(0, { message: 'Le montant doit etre positif' })
  amount?: number;

  @ApiPropertyOptional({ example: 'Paiement de la deuxieme tranche des travaux' })
  @IsOptional()
  @IsString({ message: 'La description doit etre une chaine de caracteres' })
  description?: string;
}
