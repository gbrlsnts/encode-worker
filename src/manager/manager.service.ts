import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobQueueItem, JobState, WorkerJob } from '../common';
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

  /**
   * Push a job to the next state, if any
   *
   * @param currentState current state
   * @param carryOverJob job data that is being carried over
   * @param returnData returned data in  current state
   */
  async pushJobState(
    currentState: JobState,
    carryOverJob: JobQueueItem,
    returnData?: any,
  ): Promise<void> {
    const state = this.getNextState(currentState);

    if (!state) return;

    const queue = this.stateQueueMap.get(state);

    if (!queue) return;

    const job: WorkerJob = {
      ...carryOverJob,
      state,
      metadata: returnData,
    };

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
