import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignTaskDto {
  @ApiProperty({ description: 'user id' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
