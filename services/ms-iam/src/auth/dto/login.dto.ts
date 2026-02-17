import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@eproc.bj' })
  @IsEmail({}, { message: 'Adresse email invalide' })
  email!: string;

  @ApiProperty({ example: '1234' })
  @IsString({ message: 'Le mot de passe est requis' })
  @MinLength(1, { message: 'Le mot de passe est requis' })
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString({ message: 'Le token de rafraîchissement est requis' })
  refreshToken!: string;
}
