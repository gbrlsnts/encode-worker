import { Job } from 'bull';
import { EventEmitter2 } from 'eventemitter2';
import { Process, Processor } from '@nestjs/bull';
import { Inject, Scope } from '@nestjs/common';
import { downloadQueueName, sourcePathprefixProvider } from '../config';
import { FileSystem } from '../filesystem/';
import {
  DownloadResult,
  JobQueueItem,
  JobState,
  WorkerConsumer,
} from '../common';

@Processor({
  name: downloadQueueName,
  scope: Scope.REQUEST,
})
export class DownloadConsumer extends WorkerConsumer {
  constructor(
    private filesystem: FileSystem,
    eventEmitter: EventEmitter2,
    @Inject(sourcePathprefixProvider)
    workingDirectory = 'source',
  ) {
    super(eventEmitter, DownloadConsumer.name, workingDirectory);
  }

  getWorkerState(): JobState {
    return JobState.Download;
  }

  @Process()
  async download(job: Job<JobQueueItem>): Promise<DownloadResult> {
    this.initializeStorage(job.data.query.source);

    const localPath = this.makeLocalFilePath(`${job.data.jobId}.job`);

    const src = job.data.query.source.url;

    await this.filesystem.download(src, localPath);

    return {
      sourcePath: localPath,
    };
  }
}
