import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'task title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'task description', required: false })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'project id' })
  @IsNumber()
  projectId: number;
}
