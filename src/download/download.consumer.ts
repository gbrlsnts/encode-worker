import { Job } from 'bull';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { downloadQueue } from '../config';

@Processor(downloadQueue)
export class DownloadConsumer {
  private logger: Logger = new Logger(DownloadConsumer.name);

  @Process()
  async download(job: Job<any>) {
    return;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.data.id}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job) {
    this.logger.log(`Completed job ${job.data.id}`);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error(error, error.stack);
  }
}
