import { Job } from 'bull';
import { EventEmitter2 } from 'eventemitter2';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { downloadQueueName, SOURCE_PATH } from '../config';
import { FileSystem } from '../filesystem/';
import {
  DownloadResult,
  JobQueueItem,
  JobState,
  WorkerConsumer,
} from '../common';

@Processor(downloadQueueName)
export class DownloadConsumer extends WorkerConsumer {
  constructor(
    protected filesystem: FileSystem,
    eventEmitter: EventEmitter2,
    @Inject(SOURCE_PATH)
    workingDirectory = 'source',
  ) {
    super(eventEmitter, DownloadConsumer.name, workingDirectory);
  }

  getWorkerState(): JobState {
    return JobState.Download;
  }

  @Process()
  async download(job: Job<JobQueueItem>): Promise<DownloadResult> {
    this.injectConfigMetadata(job.data.query.source);
    const storage = this.filesystem.getGateway(job.data.query.source);

    const localPath = this.makeLocalFilePath(`${job.data.jobId}.job`);

    const src = job.data.query.source.url;

    await storage.download(src, localPath);

    return {
      sourcePath: localPath,
    };
  }
}
