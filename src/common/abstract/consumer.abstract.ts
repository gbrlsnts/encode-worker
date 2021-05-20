import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
} from '@nestjs/bull';
import {
  JobCompletedEvent,
  jobCompletedTopic,
  JobQueueItem,
  JobStartedEvent,
  jobStartedTopic,
  JobState,
} from 'src/common';

export abstract class WorkerConsumer {
  protected readonly logger: Logger;

  constructor(
    protected readonly eventEmitter: EventEmitter2,
    consumerClassName: string,
  ) {
    this.logger = new Logger(consumerClassName);
  }

  abstract getWorkerState(): JobState;

  @OnQueueActive()
  onActive(job: Job) {
    const payload = new JobStartedEvent();

    payload.state = this.getWorkerState();
    payload.data = job.data;

    this.eventEmitter.emit(jobStartedTopic, payload);
  }

  @OnQueueCompleted()
  onComplete(job: Job<JobQueueItem>) {
    const payload = new JobCompletedEvent();

    payload.state = this.getWorkerState();
    payload.data = job.data;

    this.eventEmitter.emit(jobCompletedTopic, payload);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error('Got error', error.stack);
  }

  @OnQueueFailed()
  onFailed(job: Job<JobQueueItem>, error: Error) {
    this.logger.error(`Error on job ${job.data.jobId}`, error.stack);
  }
}
