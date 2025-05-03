import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TasksService } from '../tasks/tasks.service';
import { assertCanAccess } from '../common/guards/task-ownership.utils';
import { UsersService } from '../users/users.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    taskId: number,
    dto: CreateCommentDto,
    authorData: { userId: number },
  ): Promise<Comment> {
    const task = await this.tasksService.findOne(taskId);
    const user = await this.usersService.findById(authorData.userId);

    assertCanAccess(task, authorData.userId);

    const comment = this.commentRepo.create({
      content: dto.content,
      author: user,
      task,
    });

    return this.commentRepo.save(comment);
  }

  async remove(
    taskId: number,
    commentId: number,
    userId: number,
  ): Promise<void> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.task.id !== taskId) {
      throw new BadRequestException('Comment does not belong to this task');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can delete only your own comments');
    }

    await this.commentRepo.remove(comment);
  }

  async update(
    taskId: number,
    commentId: number,
    dto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'task'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.task.id !== taskId) {
      throw new BadRequestException('Comment does not belong to this task');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('You can edit only your own comments');
    }

    comment.content = dto.content;
    comment.editedAt = new Date();

    return this.commentRepo.save(comment);
  }

  async replyToComment(
    taskId: number,
    parentId: number,
    dto: CreateCommentDto,
    authorData: { userId: number },
  ): Promise<Comment> {
    const task = await this.tasksService.findOne(taskId);
    const parent = await this.commentRepo.findOne({
      where: { id: parentId },
      relations: ['task'],
    });

    if (!parent || parent.task.id !== taskId) {
      throw new BadRequestException('Invalid parent comment');
    }
    const user = await this.usersService.findById(authorData.userId);

    assertCanAccess(task, authorData.userId);

    const reply = this.commentRepo.create({
      content: dto.content,
      author: user,
      task,
      parent, // ✅ მთავარი აქ არის ეს
    });

    return this.commentRepo.save(reply);
  }

  async findByTask(taskId: number, userId: number): Promise<Comment[]> {
    const task = await this.tasksService.findOne(taskId);

    assertCanAccess(task, userId);

    const comments = await this.commentRepo.find({
      where: { task: { id: taskId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
    return comments;
  }
}
