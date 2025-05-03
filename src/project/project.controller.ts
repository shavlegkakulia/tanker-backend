import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectService } from './project.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create project' })
  @Post()
  async create(@Body('name') name: string, @Request() req) {
    return this.projectService.createProject(name, req.user);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get projects' })
  @Get()
  async getMyProjects(@Request() req) {
    return this.projectService.getProjectsForUser(req.user.userId);
  }
}
