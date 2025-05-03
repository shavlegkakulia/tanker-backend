import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

export enum ProjectRoles {
  owner = 'OWNER',
  member = 'MEMBER',
  viewer = 'VIEWER',
}

@Entity()
export class ProjectMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({
    type: 'enum',
    enum: ProjectRoles,
  })
  role: ProjectRoles;
}
