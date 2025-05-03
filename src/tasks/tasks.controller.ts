import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UsersService } from '../users/users.service';
import { TaskStatus } from './entities/task.entity';
import { AssignTaskDto } from './dto/assign-task.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create task' })
  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    const user = await this.usersService.findById(req.user.userId);

    return this.tasksService.create(createTaskDto, user);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get task by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update task' })
  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @Request() req,
  ) {
    return this.tasksService.updateStatus(
      +id,
      updateTaskStatusDto,
      req.user.userId,
    );
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all tasks' })
  @Get()
  findAll(@Query('status') status?: TaskStatus, @Request() req?) {
    return this.tasksService.findAllFiltered(status, req.user.userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign task to user' })
  @Post(':id/assign')
  async assignTask(@Param('id') taskId: string, @Body() dto: AssignTaskDto) {
    return this.tasksService.assignTask(+taskId, dto.userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete task' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(+id, req.user.userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get task by id' })
  @Get(':id')
  async getTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOneSecure(+id, req.user.userId);
  }
}
