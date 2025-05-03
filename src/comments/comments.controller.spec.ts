import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockService = {
    create: jest.fn().mockResolvedValue('created-comment'),
    findByTask: jest.fn().mockResolvedValue(['comment1', 'comment2']),
    remove: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue('updated-comment'),
    replyToComment: jest.fn().mockResolvedValue('reply-comment'),
  };

  const mockUser = { userId: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it('should call create comment', async () => {
    const dto: CreateCommentDto = { content: 'test' };
    const result = await controller.create('1', dto, { user: mockUser });
    expect(service.create).toHaveBeenCalledWith(1, dto, mockUser);
    expect(result).toBe('created-comment');
  });

  it('should return all comments for task', async () => {
    const result = await controller.findAll('1', { user: mockUser });
    expect(service.findByTask).toHaveBeenCalledWith(1, 1);
    expect(result).toEqual(['comment1', 'comment2']);
  });

  it('should delete comment', async () => {
    await controller.remove('1', '2', { user: mockUser });
    expect(service.remove).toHaveBeenCalledWith(1, 2, 1);
  });

  it('should update comment', async () => {
    const dto: UpdateCommentDto = { content: 'edited' };
    const result = await controller.update('1', '2', dto, { user: mockUser });
    expect(service.update).toHaveBeenCalledWith(1, 2, dto, 1);
    expect(result).toBe('updated-comment');
  });

  it('should reply to comment', async () => {
    const dto: CreateCommentDto = { content: 'reply' };
    const result = await controller.reply('1', '2', dto, { user: mockUser });
    expect(service.replyToComment).toHaveBeenCalledWith(1, 2, dto, mockUser);
    expect(result).toBe('reply-comment');
  });
});
