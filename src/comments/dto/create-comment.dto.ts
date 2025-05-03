import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'comment content' })
  @IsNotEmpty()
  content: string;
}
