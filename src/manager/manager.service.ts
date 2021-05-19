import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobState, JobQueueItem } from '../common';
import { encodeQueueName, storeQueueName } from '../config/queue';

@Injectable()
export class ManagerService {
  private readonly stateQueueMap: Map<JobState, Queue>;

  constructor(
    @InjectQueue(encodeQueueName) private encodeQueue: Queue,
    @InjectQueue(storeQueueName) private storeQueue: Queue,
  ) {
    this.stateQueueMap = new Map<JobState, Queue>([
      [JobState.Encode, encodeQueue],
      [JobState.Store, storeQueue],
    ]);
  }

  async pushJobState(currentState: JobState, job: JobQueueItem): Promise<void> {
    const state = this.getNextState(currentState);

    if (!state) return;

    const queue = this.stateQueueMap.get(state);

    if (!queue) return;

    await queue.add(job);
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
