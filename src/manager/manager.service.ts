import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobState } from '../common';
import { JobRepository } from './job.repository';
import { Job } from './job.entity';
import { SaveJobDto } from './dto/save-job.dto';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(JobRepository)
    private jobRepository: JobRepository,
  ) {}

  async saveJob(job: SaveJobDto): Promise<Job> {
    let dbJob = await this.jobRepository.findOne({
      externalId: job.externalId,
    });

    if (!dbJob) dbJob = this.jobRepository.create(job);
    else Object.assign(dbJob, job);

    return this.jobRepository.save(dbJob);
  }

  async pushJobState(id: string): Promise<void> {
    const job = await this.jobRepository.findOneOrFail(id);
    const state = this.getNextState(job.queue);

    if (state) job.queue = state;
    if (this.isLastState) job.completeAt = new Date();

    await this.jobRepository.save(job);
  }

  getNextState(state: JobState | string): JobState | undefined {
    const states = Object.values(JobState);
    const index = states.findIndex((t) => t === state);

    return states?.[index + 1];
  }

  isLastState(state: JobState | string): boolean {
    const states = Object.values(JobState);

    return states.findIndex((t) => t === state) === states.length;
  }
}
