// task-history.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskHistory } from './entities/task-history.entity';
import { TaskHistoryService } from './task-history.service';
import { TaskHistoryController } from './task-history.controller';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskHistory]),
    forwardRef(() => TasksModule),
  ],
  providers: [TaskHistoryService],
  exports: [TaskHistoryService],
  controllers: [TaskHistoryController], // გამოიყენება სხვაგან (tasks.service.ts-ში)
})
export class TaskHistoryModule {}
