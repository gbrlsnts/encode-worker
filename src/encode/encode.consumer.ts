import { Job } from 'bull';
import { distinct, tap } from 'rxjs/operators';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { encodeQueueName, outputPathprefixProvider } from '../config/';
import { FileSystem } from '../filesystem/filesystem.service';
import { LocationType } from 'src/filesystem/types';
import {
  EncodeJobQueueItem,
  JobState,
  rtrimChar,
  EncodeResult,
  WorkerConsumer,
} from 'src/common';
import { Encoder } from './encoder';

@Processor(encodeQueueName)
export class EncodeConsumer extends WorkerConsumer {
  private outputPathPrefix: string;

  constructor(
    private filesystem: FileSystem,
    eventEmitter: EventEmitter2,
    @Inject(outputPathprefixProvider)
    outputPathPrefix = 'output',
  ) {
    super(eventEmitter, EncodeConsumer.name);
    this.outputPathPrefix = rtrimChar(outputPathPrefix, '/');
  }

  getWorkerState(): JobState {
    return JobState.Encode;
  }

  @Process()
  async encode(job: Job<EncodeJobQueueItem>): Promise<EncodeResult> {
    const source = this.filesystem.getAbsolutePath(
      job.data.metadata.sourcePath,
      LocationType.Local,
    );

    const relativeDestination = `${this.outputPathPrefix}/${job.data.jobId}.${job.data.query.output.format}`;

    const destination = this.filesystem.getAbsolutePath(
      relativeDestination,
      LocationType.Local,
    );

    const passLogFile = this.filesystem.getAbsolutePath(
      `${this.outputPathPrefix}/${job.data.jobId}.logfile`,
      LocationType.Local,
    );

    const encoder = new Encoder(
      job.data.query.output,
      source,
      destination,
      passLogFile,
    );

    await encoder
      .run()
      .pipe(
        distinct(),
        tap((progress) => job.progress(progress)),
      )
      .toPromise();

    return {
      path: relativeDestination,
    };
  }
}
