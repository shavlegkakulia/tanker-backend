import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { passwordRegex } from '../../common/regexs/regex.values';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'user name' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'password' })
  @Matches(passwordRegex, {
    message: 'Password too weak',
  })
  password: string;
}
