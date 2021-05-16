import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobRepository } from './job.repository';
import { JobState } from './manager.types';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(JobRepository)
    private jobRepository: JobRepository,
  ) {}

  async pushJobState(id: number): Promise<void> {
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
