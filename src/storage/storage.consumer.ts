import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystem } from '../filesystem/filesystem.service';
import { storeQueueName } from '../config';
import { JobState, WorkerConsumer, StoreJobQueueItem } from '../common';

@Processor(storeQueueName)
export class StorageConsumer extends WorkerConsumer {
  constructor(protected filesystem: FileSystem, eventEmitter: EventEmitter2) {
    super(eventEmitter, StorageConsumer.name, 'output');
  }

  getWorkerState(): JobState {
    return JobState.Store;
  }

  @Process()
  async store(job: Job<StoreJobQueueItem>) {
    this.injectConfigMetadata(job.data.query.destination);
    const storage = this.filesystem.getGateway(job.data.query.destination);

    await storage.upload(
      job.data.metadata.path,
      job.data.query.destination.url,
    );
  }
}
