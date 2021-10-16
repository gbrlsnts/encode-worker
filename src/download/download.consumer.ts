import { v4 as uuidv4 } from 'uuid';
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
import { downloadQueueName, sourcePathprefixProvider } from '../config';
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
    this.httpFileDriver = new HttpFileDriver();
  }

  getWorkerState(): JobState {
    return JobState.Download;
  }

  @Process()
  async download(job: Job<JobQueueItem>): Promise<DownloadResult> {
    const uuid = uuidv4();
    const localPath = `${this.sourcePathPrefix}/${uuid}.job`;
    const src = job.data.query.source;

    if (src.startsWith('http')) {
      await this.httpFileDriver.save(src, localPath);
    } else {
      await this.filesystem.download(src, localPath);
    }

    return {
      localFilesId: uuid,
      sourcePath: localPath,
    };
  }
}
