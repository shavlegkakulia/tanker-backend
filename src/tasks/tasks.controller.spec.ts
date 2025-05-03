import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { User } from '../users/entities/user.entity';
import { Task, TaskStatus } from './entities/task.entity';
import { Project } from '../project/entities/project.entity';

const mockUser = { userId: 1 };
const userEntity: User = {
  id: 1,
  username: 'testuser',
  email: '',
  passwordHash: '',
};
const mockTask: Task = {
  id: 1,
  title: 'task',
  creator: userEntity,
  description: '',
  status: TaskStatus.DRAFT,
  comments: [],
  project: new Project(),
};

const mockTasksService = {
  create: jest.fn().mockResolvedValue(mockTask),
  findOne: jest.fn().mockResolvedValue(mockTask),
  findAllFiltered: jest.fn().mockResolvedValue([mockTask]),
  updateStatus: jest
    .fn()
    .mockResolvedValue({ ...mockTask, status: TaskStatus.IN_PROGRESS }),
  assignTask: jest
    .fn()
    .mockResolvedValue({ ...mockTask, assignee: userEntity }),
  remove: jest.fn().mockResolvedValue(undefined),
  findOneSecure: jest.fn().mockResolvedValue(mockTask),
};

const mockUsersService = {
  findById: jest.fn().mockResolvedValue(userEntity),
};

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTasksService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should create a task', async () => {
    const dto: CreateTaskDto = {
      title: 'task',
      description: 'desc',
      projectId: 1,
    };
    const result = await controller.create(dto, { user: mockUser });
    expect(mockUsersService.findById).toHaveBeenCalledWith(1);
    expect(mockTasksService.create).toHaveBeenCalled();
    expect(result).toEqual(mockTask);
  });

  it('should return one task', async () => {
    const result = await controller.findOne('1');
    expect(mockTasksService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockTask);
  });

  it('should update task status', async () => {
    const dto: UpdateTaskStatusDto = { status: TaskStatus.IN_PROGRESS };
    const result = await controller.updateStatus('1', dto, { user: mockUser });
    expect(mockTasksService.updateStatus).toHaveBeenCalledWith(1, dto, 1);
    expect(result.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('should get all filtered tasks', async () => {
    const result = await controller.findAll(undefined, { user: mockUser });
    expect(mockTasksService.findAllFiltered).toHaveBeenCalledWith(undefined, 1);
    expect(result).toEqual([mockTask]);
  });

  it('should assign task', async () => {
    const dto: AssignTaskDto = { userId: 1 };
    const result = await controller.assignTask('1', dto);
    expect(mockTasksService.assignTask).toHaveBeenCalledWith(1, 1);
    expect(result.assignee).toEqual(userEntity);
  });

  it('should delete task', async () => {
    const result = await controller.remove('1', { user: mockUser });
    expect(mockTasksService.remove).toHaveBeenCalledWith(1, 1);
    expect(result).toBeUndefined();
  });

  it('should return task with access check', async () => {
    const result = await controller.getTask('1', { user: mockUser });
    expect(mockTasksService.findOneSecure).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(mockTask);
  });
});
