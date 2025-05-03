import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
