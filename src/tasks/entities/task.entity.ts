import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Project } from '../../project/entities/project.entity';

export enum TaskStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.DRAFT,
  })
  status: TaskStatus;

  @ManyToOne(() => User, { eager: true })
  creator: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  assignee?: User; // ✅ ახალი ველი: ვის დავავალეთ

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
  project: Project;
}
