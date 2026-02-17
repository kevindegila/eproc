import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'jean.dupont@eproc.bj' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email!: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password!: string;

  @ApiProperty({ example: 'Jean' })
  @IsString({ message: 'Le prénom est requis' })
  firstName!: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString({ message: 'Le nom est requis' })
  lastName!: string;

  @ApiPropertyOptional({ example: '+229 97 00 00 00' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: ['role-ppm'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];
}
