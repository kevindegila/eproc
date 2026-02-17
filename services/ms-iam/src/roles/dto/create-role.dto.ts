import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'SUPERVISEUR' })
  @IsString({ message: 'Le code est requis' })
  code!: string;

  @ApiProperty({ example: 'Superviseur' })
  @IsString({ message: 'Le nom est requis' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignRoleDto {
  @ApiProperty()
  @IsString({ message: 'L\'identifiant utilisateur est requis' })
  userId!: string;

  @ApiProperty()
  @IsString({ message: 'L\'identifiant du rôle est requis' })
  roleId!: string;
}
