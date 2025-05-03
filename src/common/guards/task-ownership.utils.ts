import { ForbiddenException } from '@nestjs/common';
import { Task } from '../../tasks/entities/task.entity';

export function assertCanAccess(task: Task, userId: number) {
  const isCreator = task.creator.id === userId;
  const isAssignee = task.assignee?.id === userId;

  if (!isCreator && !isAssignee) {
    throw new ForbiddenException(
      'You are not allowed to perform this action on this task.',
    );
  }
}

export function assertIsCreator(task: Task, userId: number) {
  if (task.creator.id !== userId) {
    throw new ForbiddenException(
      'Only the task creator can perform this action.',
    );
  }
}
