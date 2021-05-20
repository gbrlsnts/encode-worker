import { Job } from 'bull';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { encodeQueueName, sourcePathprefixProvider } from '../config/';
import { FileSystem } from '../filesystem/filesystem.service';
import {
  JobCompletedEvent,
  jobCompletedTopic,
  JobQueueItem,
  JobStartedEvent,
  jobStartedTopic,
  JobState,
} from 'src/common';

@Processor(encodeQueueName)
export class EncodeConsumer {
  private logger: Logger = new Logger(EncodeConsumer.name);
  private sourcePathPrefix: string;

  constructor(
    private eventEmitter: EventEmitter2,
    private filesystem: FileSystem,
    @Inject(sourcePathprefixProvider)
    sourcePathPrefix = 'source',
  ) {
    if (sourcePathPrefix.endsWith('/')) {
      sourcePathPrefix = sourcePathPrefix.substring(
        0,
        sourcePathPrefix.length - 1,
      );
    }

    this.sourcePathPrefix = sourcePathPrefix;
  }

  @Process()
  async download(job: Job<JobQueueItem>) {
    return;
  }

  @OnQueueActive()
  onActive(job: Job) {
    const payload = new JobStartedEvent();

    payload.state = JobState.Encode;
    payload.data = job.data;

    this.eventEmitter.emit(jobStartedTopic, payload);
  }

  @OnQueueCompleted()
  onComplete(job: Job<JobQueueItem>) {
    const payload = new JobCompletedEvent();

    payload.state = JobState.Encode;
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
