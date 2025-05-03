import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ description: 'comment content' })
  @IsNotEmpty()
  content: string;
}
