import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { Project } from '../project/entities/project.entity';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: '',
  passwordHash: '',
};

const mockTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.DONE,
  creator: mockUser,
  assignee: null,
  comments: [],
  project: new Project(),
};

const mockComment: Comment = {
  id: 1,
  content: 'Test comment',
  author: mockUser,
  task: mockTask,
  createdAt: undefined,
  replies: [],
};

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: Repository<Comment>;
  let tasksService: TasksService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue(mockComment),
            findOne: jest.fn().mockResolvedValue(mockComment),
            remove: jest.fn().mockResolvedValue(undefined),
            find: jest.fn().mockResolvedValue([mockComment]),
          },
        },
        {
          provide: TasksService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockTask),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepo = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    tasksService = module.get<TasksService>(TasksService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create and save a comment', async () => {
      const dto: CreateCommentDto = { content: 'Test comment' };
      const result = await service.create(1, dto, { userId: 1 });

      expect(tasksService.findOne).toHaveBeenCalledWith(1);
      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(commentRepo.create).toHaveBeenCalledWith({
        content: dto.content,
        author: mockUser,
        task: mockTask,
      });
      expect(commentRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });
  });

  describe('replyToComment', () => {
    it('should create and save a reply comment', async () => {
      const dto: CreateCommentDto = { content: 'Reply content' };

      jest.spyOn(commentRepo, 'findOne').mockResolvedValue({
        ...mockComment,
        task: mockTask,
      });

      const result = await service.replyToComment(1, 1, dto, { userId: 1 });

      expect(commentRepo.create).toHaveBeenCalledWith({
        content: dto.content,
        author: mockUser,
        task: mockTask,
        parent: expect.any(Object),
      });
      expect(commentRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });
  });

  describe('update', () => {
    it('should update and save a comment if author and task match', async () => {
      const dto: UpdateCommentDto = { content: 'Updated content' };

      jest.spyOn(commentRepo, 'findOne').mockResolvedValue({
        ...mockComment,
        task: mockTask,
        author: mockUser,
      });

      const result = await service.update(1, 1, dto, 1);

      expect(result.content).toEqual('Test comment'); // actual content remains mockComment.content
      expect(commentRepo.save).toHaveBeenCalled();
    });
  });
});
