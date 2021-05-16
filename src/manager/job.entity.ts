import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { JobState } from '../common/';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  externalId: string;

  @Column()
  @Index()
  queue: JobState;

  @Column({
    default: 0,
  })
  priority: number;

  @CreateDateColumn({
    nullable: true,
  })
  queuedAt: Date;

  @Column({
    nullable: true,
  })
  reservedAt: Date;

  @Column({
    nullable: true,
  })
  completeAt: Date;

  @Column('text')
  data: string;
}
