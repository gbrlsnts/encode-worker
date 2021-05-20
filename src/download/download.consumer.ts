import { v4 as uuidv4 } from 'uuid';
import { Job } from 'bull';
import { EventEmitter2 } from 'eventemitter2';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import {
  JobCompletedEvent,
  jobCompletedTopic,
  JobQueueItem,
  JobState,
} from '../common';
import { downloadQueueName, sourcePathprefixProvider } from '../config';
import { FileSystem } from '../filesystem/filesystem.service';
import { JobStartedEvent } from '../common/events/job-started.event';
import { jobStartedTopic } from '../common/events/event-topics';

@Processor(downloadQueueName)
export class DownloadConsumer {
  private logger: Logger = new Logger(DownloadConsumer.name);
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
    const uuid = uuidv4();
    const localPath = `${this.sourcePathPrefix}/${uuid}.job`;

    await this.filesystem.download(job.data.query.source, localPath);

    job.data.metadata = {
      localFilesId: uuid,
      sourcePath: localPath,
      priority: job.opts.priority,
    };
  }

  @OnQueueActive()
  onActive(job: Job) {
    const payload = new JobStartedEvent();

    payload.state = JobState.Download;
    payload.data = job.data;

    this.eventEmitter.emit(jobStartedTopic, payload);
  }

  @OnQueueCompleted()
  onComplete(job: Job<JobQueueItem>) {
    const payload = new JobCompletedEvent();

    payload.state = JobState.Download;
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
