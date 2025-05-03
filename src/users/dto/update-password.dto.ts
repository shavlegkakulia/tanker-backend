import { IsString, Matches } from 'class-validator';
import { passwordRegex } from '../../common/regexs/regex.values';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'new password' })
  @IsString()
  @Matches(passwordRegex, {
    message: 'Password too weak',
  })
  newPassword: string;

  @ApiProperty({ description: 'old password' })
  @IsString()
  oldPassword: string;
}
