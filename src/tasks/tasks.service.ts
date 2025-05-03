import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  assertIsCreator,
  assertCanAccess,
} from '../common/guards/task-ownership.utils'; // ✅ ახალი იმპორტი
import { TaskHistoryService } from '../task-history/task-history.service';
import { ProjectService } from '../project/project.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly usersService: UsersService, // ✅ დაგვჭირდება
    private readonly taskHistoryService: TaskHistoryService, // ✅ ისტორიის სერვისი
    private readonly projectService: ProjectService,
  ) {}

  async create(createTaskDto: CreateTaskDto, creator: User): Promise<Task> {
    const project = await this.projectService.assertProjectMember(
      createTaskDto.projectId,
      creator.id,
    );

    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const createdTask = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      creator,
      project, // აქ მიბმული პროექტი
    });

    const savedTask = await this.tasksRepository.save(createdTask);

    await this.taskHistoryService.addEntry(
      savedTask,
      creator,
      'task-created',
      `${creator.username} created task`,
    ); // ✅ ისტორიის ჩაწერა

    return savedTask;
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async updateStatus(
    id: number,
    dto: UpdateTaskStatusDto,
    userId: number,
  ): Promise<Task> {
    const task = await this.findOne(id);
    await this.projectService.assertProjectMember(task.project.id, userId);

    assertCanAccess(task, userId); // თუ გაქვს წვდომის შემოწმება

    const oldStatus = task.status;
    task.status = dto.status;
    const updated = await this.tasksRepository.save(task);

    const user = await this.usersService.findById(userId); // ავტორის Entity
    await this.taskHistoryService.logStatusChange(
      task,
      user,
      oldStatus,
      dto.status,
    ); // ✅ ისტორიის ჩაწერა

    return updated;
  }

  async findAllFiltered(
    status?: TaskStatus,
    currentUserId?: number,
  ): Promise<Task[]> {
    if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new BadRequestException('Invalid status');
    }

    const where: FindOptionsWhere<Task>[] = [];

    if (!currentUserId) {
      throw new BadRequestException('Missing user context');
    }

    if (status) {
      where.push({ status, creator: { id: currentUserId } });
      where.push({ status, assignee: { id: currentUserId } });
    } else {
      where.push({ creator: { id: currentUserId } });
      where.push({ assignee: { id: currentUserId } });
    }

    return this.tasksRepository.find({ where });
  }

  async assignTask(taskId: number, userId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    assertIsCreator(task, userId);
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    task.assignee = user;
    return this.tasksRepository.save(task);
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id);
    await this.projectService.assertProjectMember(task.project.id, userId);

    assertIsCreator(task, userId);

    if (task.creator.id !== userId) {
      throw new ForbiddenException('You are not allowed to delete this task.');
    }

    await this.tasksRepository.remove(task);
  }

  async findOneSecure(id: number, userId: number): Promise<Task> {
    const task = await this.findOne(id); // უკვე არსებული მეთოდი
    await this.projectService.assertProjectMember(task.project.id, userId);

    assertCanAccess(task, userId); // ვამოწმებთ, რომ მომხმარებელს აქვს წვდომა ამ დავალებაზე

    return task;
  }

  async findOneWithAccess(taskId: number, userId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    assertCanAccess(task, userId);
    return task;
  }
}
