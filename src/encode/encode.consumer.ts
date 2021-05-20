import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { encodeQueueName, sourcePathprefixProvider } from '../config/';
import { FileSystem } from '../filesystem/filesystem.service';
import { JobQueueItem, JobState, rtrimChar } from 'src/common';
import { WorkerConsumer } from '../common/abstract/consumer.abstract';

@Processor(encodeQueueName)
export class EncodeConsumer extends WorkerConsumer {
  private sourcePathPrefix: string;

  constructor(
    private filesystem: FileSystem,
    eventEmitter: EventEmitter2,
    @Inject(sourcePathprefixProvider)
    sourcePathPrefix = 'source',
  ) {
    super(eventEmitter, EncodeConsumer.name);
    this.sourcePathPrefix = rtrimChar(sourcePathPrefix, '/');
  }

  getWorkerState(): JobState {
    return JobState.Encode;
  }

  @Process()
  async encode(job: Job<JobQueueItem>) {
    return;
  }
}
