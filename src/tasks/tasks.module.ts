import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { UsersModule } from '../users/users.module';
import { TaskHistoryModule } from '../task-history/task-history.module'; // Importing taskHistoryModule
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UsersModule,
    ProjectModule,
    forwardRef(() => TaskHistoryModule),
  ], // Importing TypeOrmModule for Task entity and UsersModule
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // Exporting TasksService to be used in other modules
})
export class TasksModule {}
