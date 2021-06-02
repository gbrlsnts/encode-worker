import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystem } from '../filesystem/filesystem.service';
import { storeQueueName } from '../config/queue';
import { JobState, WorkerConsumer, StoreJobQueueItem } from '../common';
import { LocationType } from 'src/filesystem/types';

@Processor(storeQueueName)
export class StorageConsumer extends WorkerConsumer {
  constructor(private filesystem: FileSystem, eventEmitter: EventEmitter2) {
    super(eventEmitter, StorageConsumer.name);
  }

  getWorkerState(): JobState {
    return JobState.Store;
  }

  @Process()
  async storage(job: Job<StoreJobQueueItem>) {
    const localFilesystem = this.filesystem.getStorageByLocationType(
      LocationType.Local,
    );

    const localFile = job.data.metadata.path;

    if (!localFilesystem.exists(localFile))
      throw new Error('File does not exist');

    await this.filesystem.upload(localFile, job.data.query.destination.url);
  }
}
