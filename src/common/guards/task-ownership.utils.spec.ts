import { ForbiddenException } from '@nestjs/common';
import { assertCanAccess, assertIsCreator } from './task-ownership.utils';
import { Task, TaskStatus } from '../../tasks/entities/task.entity';
import { Project } from '../../project/entities/project.entity';

describe('Task Ownership Utils', () => {
  const task: Task = {
    creator: {
      id: 1,
      email: '',
      username: '',
      passwordHash: '',
    },
    assignee: {
      id: 2,
      email: '',
      username: '',
      passwordHash: '',
    },
    id: 0,
    title: '',
    description: '',
    status: TaskStatus.DRAFT,
    comments: [],
    project: new Project(),
  };

  describe('assertCanAccess', () => {
    it('should allow creator', () => {
      expect(() => assertCanAccess(task, 1)).not.toThrow();
    });

    it('should allow assignee', () => {
      expect(() => assertCanAccess(task, 2)).not.toThrow();
    });

    it('should throw if neither creator nor assignee', () => {
      expect(() => assertCanAccess(task, 3)).toThrow(ForbiddenException);
    });
  });

  describe('assertIsCreator', () => {
    it('should allow creator', () => {
      expect(() => assertIsCreator(task, 1)).not.toThrow();
    });

    it('should throw if not creator', () => {
      expect(() => assertIsCreator(task, 2)).toThrow(ForbiddenException);
    });
  });
});
