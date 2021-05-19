import { Injectable } from '@nestjs/common';
import { JobState, JobQueueItem } from '../common';

@Injectable()
export class ManagerService {
  async pushJobState(currentState: JobState, job: JobQueueItem): Promise<void> {
    const state = this.getNextState(currentState);

    // push to queue if not last
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
