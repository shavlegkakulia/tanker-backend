import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProjectService = {
    createProject: jest.fn(),
    getProjectsForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
      ],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
    service = module.get<ProjectService>(ProjectService);
  });

  it('should call service createProject on POST /projects', async () => {
    const req = { user: { userId: 1, username: 'test' } } as any;
    const project = { id: 1, name: 'Test Project' };
    mockProjectService.createProject.mockResolvedValue(project);

    const result = await controller.create('Test Project', req);

    expect(result).toEqual(project);
    expect(service.createProject).toHaveBeenCalledWith(
      'Test Project',
      req.user,
    );
  });

  it('should call service getProjectsForUser on GET /projects', async () => {
    const req = { user: { userId: 1 } } as any;
    const projects = [{ id: 1, name: 'Project 1' }];
    mockProjectService.getProjectsForUser.mockResolvedValue(projects);

    const result = await controller.getMyProjects(req);

    expect(result).toEqual(projects);
    expect(service.getProjectsForUser).toHaveBeenCalledWith(1);
  });
});
