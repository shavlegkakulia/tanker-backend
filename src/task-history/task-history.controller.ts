import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { TaskHistoryService } from './task-history.service';
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks/:taskId/history')
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/history')
export class TaskHistoryController {
  constructor(
    private readonly taskHistoryService: TaskHistoryService,
    private readonly tasksService: TasksService,
  ) {}
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get task history' })
  @Get()
  async getHistory(@Param('taskId') taskId: string, @Request() req) {
    const task = await this.tasksService.findOneWithAccess(
      +taskId,
      req.user.userId,
    );
    return this.taskHistoryService.findByTask(task.id);
  }
}
