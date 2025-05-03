import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ProjectMember, ProjectRoles } from './entities/project-member.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,

    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
    private readonly userService: UsersService,
  ) {}

  async createProject(name: string, owner: User): Promise<Project> {
    const user = await this.userService.findById(owner.id);
    const project = this.projectRepo.create({ name, owner: user });

    const savedProject = await this.projectRepo.save(project);

    const member = this.projectMemberRepo.create({
      project: savedProject,
      user,
      role: ProjectRoles.owner,
    });

    await this.projectMemberRepo.save(member);

    return savedProject;
  }

  async getProjectsForUser(userId: number): Promise<Project[]> {
    return this.projectRepo.find({
      where: {
        members: {
          user: { id: userId },
        },
      },
      relations: ['owner', 'members', 'members.user'],
    });
  }

  async findOneById(id: number): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async assertProjectMember(
    projectId: number,
    userId: number,
  ): Promise<Project> {
    const project = await this.findOneById(projectId);

    const isMember = project.members.some(
      (member) => member.user.id === userId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return project;
  }
}
