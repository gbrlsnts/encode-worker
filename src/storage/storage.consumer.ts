import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileSystem } from '../filesystem/filesystem.service';
import { storeQueueName, rootDirectory } from '../config';
import { JobState, WorkerConsumer, StoreJobQueueItem } from '../common';
import { LocationType } from 'src/filesystem/types';
import { HttpFileDriver } from '../lib/';

@Processor(storeQueueName)
export class StorageConsumer extends WorkerConsumer {
  private httpFileDriver: HttpFileDriver;

  constructor(private filesystem: FileSystem, eventEmitter: EventEmitter2) {
    super(eventEmitter, StorageConsumer.name);

    // should be injected
    this.httpFileDriver = new HttpFileDriver(rootDirectory);
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

    const dest = job.data.query.destination.url;

    if (dest.startsWith('http')) {
      await this.httpFileDriver.upload(dest, localFile);
    } else {
      const { key, secret } = job.data.query.destination;

      await this.filesystem.upload(localFile, job.data.query.destination.url, {
        key,
        secret,
      });
    }
  }
}
