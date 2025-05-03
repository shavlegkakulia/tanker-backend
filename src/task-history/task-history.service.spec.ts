import { Test, TestingModule } from '@nestjs/testing';
import { TaskHistoryService } from './task-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskHistory } from './entities/task-history.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: '',
} as User;

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Some description',
  status: TaskStatus.DONE,
  creator: mockUser,
  assignee: null,
  comments: [],
} as Task;

const mockEntry: TaskHistory = {
  id: 1,
  task: mockTask,
  user: mockUser,
  action: 'assigned',
  detail: 'assigned to testuser',
  createdAt: new Date(),
} as TaskHistory;

describe('TaskHistoryService', () => {
  let service: TaskHistoryService;
  let repo: Repository<TaskHistory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskHistoryService,
        {
          provide: getRepositoryToken(TaskHistory),
          useValue: {
            create: jest.fn().mockReturnValue(mockEntry),
            save: jest.fn().mockResolvedValue(mockEntry),
            find: jest.fn().mockResolvedValue([mockEntry]),
          },
        },
      ],
    }).compile();

    service = module.get<TaskHistoryService>(TaskHistoryService);
    repo = module.get<Repository<TaskHistory>>(getRepositoryToken(TaskHistory));
  });

  it('should create and save a history entry', async () => {
    const result = await service.addEntry(
      mockTask,
      mockUser,
      'assigned',
      'assigned to testuser',
    );
    expect(repo.create).toHaveBeenCalledWith({
      task: mockTask,
      user: mockUser,
      action: 'assigned',
      detail: 'assigned to testuser',
    });
    expect(repo.save).toHaveBeenCalledWith(mockEntry);
    expect(result).toEqual(mockEntry);
  });

  it('should log status change', async () => {
    const result = await service.logStatusChange(
      mockTask,
      mockUser,
      'OPEN',
      'IN_PROGRESS',
    );
    expect(repo.create).toHaveBeenCalledWith({
      task: mockTask,
      user: mockUser,
      action: 'status_changed',
      detail: 'status: OPEN → IN_PROGRESS',
    });
    expect(result).toEqual(mockEntry);
  });

  it('should log assignment', async () => {
    const result = await service.logAssignment(mockTask, mockUser, mockUser);
    expect(repo.create).toHaveBeenCalledWith({
      task: mockTask,
      user: mockUser,
      action: 'assigned',
      detail: 'assigned to testuser',
    });
    expect(result).toEqual(mockEntry);
  });

  it('should find history by task', async () => {
    const result = await service.findByTask(1);
    expect(repo.find).toHaveBeenCalledWith({
      where: { task: { id: 1 } },
      order: { createdAt: 'ASC' },
    });
    expect(result).toEqual([mockEntry]);
  });
});
