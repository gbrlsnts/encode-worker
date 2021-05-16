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
import { Logger } from '@nestjs/common';
import {
  JobCompletedEvent,
  jobCompletedTopic,
  JobQueueItem,
  JobState,
} from '../common';
import { downloadQueue } from '../config';
import { FileSystem } from '../filesystem/filesystem.service';

@Processor(downloadQueue)
export class DownloadConsumer {
  private logger: Logger = new Logger(DownloadConsumer.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private filesystem: FileSystem,
  ) {}

  @Process()
  async download(job: Job<JobQueueItem>) {
    const uuid = uuidv4();
    const fileName = `${uuid}.job`;

    await this.filesystem.download(job.data.query.source, fileName);

    job.data.metadata.localId = uuid;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.data.jobId}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job<JobQueueItem>) {
    const payload = new JobCompletedEvent();

    payload.state = JobState.Download;
    payload.data = job.data;

    this.eventEmitter.emit(jobCompletedTopic, payload);

    this.logger.log(`Completed job ${job.data.jobId}`);
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
