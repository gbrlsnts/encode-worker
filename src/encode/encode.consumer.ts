import { Job } from 'bull';
import { lastValueFrom } from 'rxjs';
import { distinct, tap } from 'rxjs/operators';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { encodeQueueName, OUTPUT_PATH } from '../config/';
import {
  EncodeJobQueueItem,
  JobState,
  EncodeResult,
  WorkerConsumer,
} from 'src/common';
import { Encoder } from './encoder';

@Processor(encodeQueueName)
export class EncodeConsumer extends WorkerConsumer {
  constructor(
    eventEmitter: EventEmitter2,
    @Inject(OUTPUT_PATH)
    outputPathPrefix = 'output',
  ) {
    super(eventEmitter, EncodeConsumer.name, outputPathPrefix);
  }

  getWorkerState(): JobState {
    return JobState.Encode;
  }

  @Process()
  async encode(job: Job<EncodeJobQueueItem>): Promise<EncodeResult> {
    const destination = this.makeLocalFilePath(
      `${job.data.jobId}.${job.data.query.output.format}`,
    );

    const passLogFile = this.makeLocalFilePath(`${job.data.jobId}.logfile`);

    const encoder = new Encoder(
      job.data.query.output,
      job.data.metadata.sourcePath,
      destination,
      passLogFile,
    );

    const observable = encoder.run().pipe(
      distinct(),
      tap((progress) => job.progress(progress)),
    );

    await lastValueFrom(observable);

    return {
      path: destination,
    };
  }
}
