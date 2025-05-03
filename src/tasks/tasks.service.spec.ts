import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { UsersService } from '../users/users.service';
import { TaskHistoryService } from '../task-history/task-history.service';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { ProjectService } from '../project/project.service';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: '',
};

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Some description',
  status: TaskStatus.DRAFT,
  creator: mockUser,
  assignee: null,
  comments: [],
  project: new Project(),
};

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepo: Repository<Task>;
  let usersService: UsersService;
  let taskHistoryService: TaskHistoryService;

  const mockProject = { id: 1, name: 'Test Project' } as Project;

  const mockProjectService = {
    assertProjectMember: jest.fn().mockResolvedValue(mockProject),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn().mockImplementation((dto) => ({ ...dto })),
            save: jest.fn().mockResolvedValue(mockTask),
            findOne: jest.fn().mockResolvedValue(mockTask),
            find: jest.fn().mockResolvedValue([mockTask]),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: TaskHistoryService,
          useValue: {
            addEntry: jest.fn(),
            logStatusChange: jest.fn(),
          },
        },
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tasksRepo = module.get<Repository<Task>>(getRepositoryToken(Task));
    usersService = module.get<UsersService>(UsersService);
    taskHistoryService = module.get<TaskHistoryService>(TaskHistoryService);
  });

  describe('create', () => {
    it('should create task linked to project', async () => {
      const user = { id: 1 } as User;

      const task = {
        id: 1,
        title: 'Test',
        creator: user,
        project: mockProject,
      } as Task;

      jest.spyOn(tasksRepo, 'create').mockReturnValue(task);
      jest.spyOn(tasksRepo, 'save').mockResolvedValue(task);

      const result = await service.create(
        { title: 'Test', description: '...', projectId: mockProject.id },
        user,
      );

      expect(mockProjectService.assertProjectMember).toHaveBeenCalledWith(
        mockProject.id,
        1,
      );
      expect(result).toEqual(task);
      expect(tasksRepo.create).toHaveBeenCalled();
      expect(taskHistoryService.addEntry).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find and return a task', async () => {
      const result = await service.findOne(1);
      expect(tasksRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['project'],
      });
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const task = {
        id: 1,
        status: TaskStatus.DRAFT,
        creator: { id: 1 },
        project: { id: 1 },
      } as Task;

      jest.spyOn(tasksRepo, 'findOne').mockResolvedValue(task);
      jest.spyOn(tasksRepo, 'save').mockResolvedValue(task);

      const result = await service.updateStatus(
        1,
        { status: TaskStatus.IN_PROGRESS } as any,
        1,
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(taskHistoryService.logStatusChange).toHaveBeenCalled();
    });

    it('should throw if not creator or assignee updating task', async () => {
      const task = {
        id: 1,
        status: TaskStatus.DRAFT,
        creator: { id: 2 },
        project: { id: 1 },
      } as any;
      jest.spyOn(tasksRepo, 'findOne').mockResolvedValue(task);

      await expect(
        service.updateStatus(1, { status: 'DONE' } as any, 1),
      ).rejects.toThrow();
    });
  });

  describe('assignTask', () => {
    it('should assign task to user and save it', async () => {
      const result = await service.assignTask(1, 1);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(tasksRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should remove task if user is creator', async () => {
      const result = await service.remove(1, 1);

      expect(tasksRepo.remove).toHaveBeenCalledWith(mockTask);
      expect(result).toBeUndefined();
    });
  });

  describe('findAllFiltered', () => {
    it('should return tasks filtered by userId only', async () => {
      const result = await service.findAllFiltered(undefined, 1);
      expect(tasksRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });

    it('should return tasks filtered by status and userId', async () => {
      const result = await service.findAllFiltered(TaskStatus.DRAFT, 1);
      expect(tasksRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOneWithAccess', () => {
    it('should return task after checking access', async () => {
      const result = await service.findOneWithAccess(1, 1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findOneSecure', () => {
    it('should return task after asserting access', async () => {
      const result = await service.findOneSecure(1, 1);
      expect(result).toEqual(mockTask);
    });
  });
});
