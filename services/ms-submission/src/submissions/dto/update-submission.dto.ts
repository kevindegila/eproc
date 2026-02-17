import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateSubmissionDto {
  @ApiPropertyOptional({ example: 'BROUILLON', description: 'Statut de la soumission' })
  @IsOptional()
  @IsString({ message: 'Le statut doit etre une chaine de caracteres' })
  status?: string;
}
