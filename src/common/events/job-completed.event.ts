import { JobQueueItem } from '../types';
import { JobState } from '../types/job.type';

export class JobCompletedEvent {
  /**
   * state where the job was completed
   */
  state: JobState;

  /**
   * job queue data
   */
  data: JobQueueItem;
}
