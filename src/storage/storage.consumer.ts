import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystem } from '../filesystem/filesystem.service';
import { storeQueueName } from '../config';
import { JobState, WorkerConsumer, StoreJobQueueItem } from '../common';

@Processor(storeQueueName)
export class StorageConsumer extends WorkerConsumer {
  constructor(private filesystem: FileSystem, eventEmitter: EventEmitter2) {
    super(eventEmitter, StorageConsumer.name, 'output');
  }

  getWorkerState(): JobState {
    return JobState.Store;
  }

  @Process()
  async store(job: Job<StoreJobQueueItem>) {
    this.initializeStorage(job.data.query.destination);

    await this.filesystem.upload(
      job.data.metadata.path,
      job.data.query.destination.url,
    );
  }
}
