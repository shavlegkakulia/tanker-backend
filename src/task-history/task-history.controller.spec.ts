import { Test, TestingModule } from '@nestjs/testing';
import { TaskHistoryController } from './task-history.controller';
import { TaskHistoryService } from './task-history.service';
import { TasksService } from '../tasks/tasks.service';
import { User } from '../users/entities/user.entity';
import { TaskHistory } from './entities/task-history.entity';
import { Task } from '../tasks/entities/task.entity';

const mockTask: User = {
  id: 1,
  email: '',
  username: '',
  passwordHash: '',
};
const mockUser = { userId: 1 };
const mockHistory: TaskHistory[] = [
  {
    id: 1,
    action: 'created',
    detail: 'created by user',
    task: new Task(),
    user: new User(),
    createdAt: undefined,
  },
];

describe('TaskHistoryController', () => {
  let controller: TaskHistoryController;
  let taskHistoryService: TaskHistoryService;
  let tasksService: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskHistoryController],
      providers: [
        {
          provide: TaskHistoryService,
          useValue: {
            findByTask: jest.fn().mockResolvedValue(mockHistory),
          },
        },
        {
          provide: TasksService,
          useValue: {
            findOneWithAccess: jest.fn().mockResolvedValue(mockTask),
          },
        },
      ],
    }).compile();

    controller = module.get<TaskHistoryController>(TaskHistoryController);
    taskHistoryService = module.get<TaskHistoryService>(TaskHistoryService);
    tasksService = module.get<TasksService>(TasksService);
  });

  it('should return task history if user has access', async () => {
    const result = await controller.getHistory('1', { user: mockUser });

    expect(tasksService.findOneWithAccess).toHaveBeenCalledWith(1, 1);
    expect(taskHistoryService.findByTask).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockHistory);
  });
});
