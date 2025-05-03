import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class TaskHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  action: string; // მაგ: 'status_changed', 'assigned', 'created'

  @Column({ nullable: true })
  detail?: string;

  @CreateDateColumn()
  createdAt: Date;
}
