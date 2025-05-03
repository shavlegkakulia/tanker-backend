import { IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskStatusDto {
  @ApiProperty({
    description: 'task satus',
    example: 'DRAFT, IN_PROGRESS, DONE...',
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
