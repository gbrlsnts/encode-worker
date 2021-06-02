import { JobEvent } from './job-common.event';

export class JobCompletedEvent extends JobEvent {
  returnValue: any;
}
