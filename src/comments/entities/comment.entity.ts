import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import {
  CreateDateColumn,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  editedAt?: Date;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => User, { eager: true })
  author: User;
  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent, { cascade: true })
  replies: Comment[];
}
