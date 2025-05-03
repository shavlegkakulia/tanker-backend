// update-profile.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: 'user name' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'user email' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
