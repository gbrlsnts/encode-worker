import { v4 as uuidv4 } from 'uuid';
import { Job } from 'bull';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { downloadQueue } from '../config';
import { FileSystem } from '../filesystem/filesystem.service';
import { EventEmitter2 } from 'eventemitter2';
import { JobCompletedEvent } from '../common/events/job-completed.event';

@Processor(downloadQueue)
export class DownloadConsumer {
  private logger: Logger = new Logger(DownloadConsumer.name);

  constructor(
    private eventEmitter: EventEmitter2,
    private filesystem: FileSystem,
  ) {}

  @Process()
  async download(job: Job<any>) {
    const uuid = uuidv4();
    const fileName = `${uuid}.job`;

    await this.filesystem.download(job.data.query.source, fileName);

    job.data.localId = uuid;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.data.jobId}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    const payload = new JobCompletedEvent();
    payload.data = job.data;

    this.eventEmitter.emit('job.completed', payload);

    this.logger.log(`Completed job ${job.data.jobId}`);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error('Got error', error.stack);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Error on job ${job.data.jobId}`, error.stack);
  }
}
