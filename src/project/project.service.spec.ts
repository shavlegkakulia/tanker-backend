// ✅ PROJECT SERVICE UNIT TEST (ProjectService.spec.ts)

import { Test, TestingModule } from '@nestjs/testing';
import { ProjectService } from './project.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectRoles } from './entities/project-member.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let projectRepo: Repository<Project>;
  let memberRepo: Repository<ProjectMember>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
    projectRepo = module.get(getRepositoryToken(Project));
    memberRepo = module.get(getRepositoryToken(ProjectMember));
  });

  it('should create project and add owner as member', async () => {
    const user = { id: 1 } as User;
    const project = { id: 1, name: 'Test', owner: user } as Project;

    // !!! create უნდა აბრუნებდეს პირდაპირ ობიექტს, არა promise-ს
    (projectRepo.create as jest.Mock).mockReturnValue(project);
    (projectRepo.save as jest.Mock).mockResolvedValue(project);

    const member = { id: 1 } as ProjectMember;
    (memberRepo.create as jest.Mock).mockReturnValue(member);
    (memberRepo.save as jest.Mock).mockResolvedValue(member);

    const result = await service.createProject('Test', user);

    expect(result).toEqual(project);
    expect(projectRepo.create).toHaveBeenCalledWith({
      name: 'Test',
    });
    expect(projectRepo.save).toHaveBeenCalledWith(project);
    expect(memberRepo.create).toHaveBeenCalledWith({
      project,
      role: ProjectRoles.owner,
    });
    expect(memberRepo.save).toHaveBeenCalledWith(member);
  });

  it('should return projects where user is member', async () => {
    const projects = [{ id: 1, name: 'Project 1' }] as Project[];
    jest.spyOn(projectRepo, 'find').mockResolvedValue(projects);

    const result = await service.getProjectsForUser(1);

    expect(result).toEqual(projects);
    expect(projectRepo.find).toHaveBeenCalledWith({
      where: { members: { user: { id: 1 } } },
      relations: ['owner', 'members', 'members.user'],
    });
  });
});
