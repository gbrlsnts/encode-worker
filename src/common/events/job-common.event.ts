import { JobQueueItem, JobState } from '../types';

export abstract class JobEvent {
  /**
   * state where the job was completed
   */
  state: JobState;

  /**
   * job queue data
   */
  data: JobQueueItem;
}
