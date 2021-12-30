import { join } from 'path';
import { Job } from 'bull';
import { EventEmitter2 } from 'eventemitter2';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import {
  DownloadResult,
  JobQueueItem,
  JobState,
  rtrimChar,
  WorkerConsumer,
} from '../common';
import {
  downloadQueueName,
  sourcePathprefixProvider,
  rootDirectory,
} from '../config';
import { FileSystem } from '../filesystem/filesystem.service';
import { HttpFileDriver } from '../lib/';

@Processor(downloadQueueName)
export class DownloadConsumer extends WorkerConsumer {
  private sourcePathPrefix: string;
  private httpFileDriver: HttpFileDriver;

  constructor(
    private filesystem: FileSystem,
    eventEmitter: EventEmitter2,
    @Inject(sourcePathprefixProvider)
    sourcePathPrefix = 'source',
  ) {
    super(eventEmitter, DownloadConsumer.name);
    this.sourcePathPrefix = rtrimChar(sourcePathPrefix, '/');

    // should be injected
    this.httpFileDriver = new HttpFileDriver(rootDirectory);
  }

  getWorkerState(): JobState {
    return JobState.Download;
  }

  @Process()
  async download(job: Job<JobQueueItem>): Promise<DownloadResult> {
    const localPath = join(this.sourcePathPrefix, `${job.data.jobId}.job`);
    const src = job.data.query.source;

    if (src.startsWith('http')) {
      await this.httpFileDriver.save(src, localPath);
    } else {
      await this.filesystem.download(src, localPath);
    }

    return {
      sourcePath: localPath,
    };
  }
}
