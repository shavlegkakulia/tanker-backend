// task-history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskHistory } from './entities/task-history.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TaskHistoryService {
  constructor(
    @InjectRepository(TaskHistory)
    private readonly taskHistoryRepo: Repository<TaskHistory>,
  ) {}

  async addEntry(
    task: Task,
    user: User,
    action: string,
    detail?: string,
  ): Promise<TaskHistory> {
    const entry = this.taskHistoryRepo.create({ task, user, action, detail });

    return this.taskHistoryRepo.save(entry);
  }

  async logStatusChange(
    task: Task,
    user: User,

    oldStatus: string,
    newStatus: string,
  ): Promise<TaskHistory> {
    const detail = `status: ${oldStatus} → ${newStatus}`;
    return this.addEntry(task, user, 'status_changed', detail);
  }

  async logAssignment(
    task: Task,
    user: User,
    assignee: User,
  ): Promise<TaskHistory> {
    const detail = `assigned to ${assignee.username}`;
    return this.addEntry(task, user, 'assigned', detail);
  }

  async findByTask(taskId: number): Promise<TaskHistory[]> {
    return this.taskHistoryRepo.find({
      where: { task: { id: taskId } },
      order: { createdAt: 'ASC' },
    });
  }
}
