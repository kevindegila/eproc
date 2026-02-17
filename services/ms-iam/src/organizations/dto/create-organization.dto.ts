import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsEmail } from 'class-validator';
import { OrganizationType } from '@eproc/shared-types';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Ministère de l\'Éducation' })
  @IsString({ message: 'Le nom est requis' })
  name!: string;

  @ApiProperty({ enum: OrganizationType })
  @IsEnum(OrganizationType, { message: 'Type d\'organisation invalide' })
  type!: OrganizationType;

  @ApiPropertyOptional({ example: 'ME' })
  @IsOptional()
  @IsString()
  sigle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Adresse email invalide' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nif?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rccm?: string;
}
