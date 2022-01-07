import { join } from 'path';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueueProgress,
} from '@nestjs/bull';
import {
  JobCompletedEvent,
  jobCompletedTopic,
  JobQueueItem,
  JobStartedEvent,
  jobStartedTopic,
  JobState,
  rtrimChar,
  StorageConfig,
} from '../../common';
import { LocalStorage, Storage, DriverFactory } from '../../filesystem/';
import { rootDirectory } from '../../config/';

export abstract class WorkerConsumer {
  protected readonly logger: Logger;

  protected storage: Storage;
  protected storageRoot = rootDirectory;
  protected workingDirectory: string;

  /**
   * Constructor
   * @param eventEmitter event emitter instance
   * @param consumerClassName the class name that is extending
   * @param workingDirectory the current working directory of the worker
   */
  constructor(
    protected readonly eventEmitter: EventEmitter2,
    consumerClassName: string,
    workingDirectory: string,
  ) {
    this.logger = new Logger(consumerClassName);
    this.workingDirectory = rtrimChar(workingDirectory, '/');
  }

  abstract getWorkerState(): JobState;

  @OnQueueActive()
  onActive(job: Job<JobQueueItem>) {
    const payload = new JobStartedEvent();

    payload.state = this.getWorkerState();
    payload.data = job.data;

    this.eventEmitter.emit(jobStartedTopic, payload);
  }

  @OnQueueProgress()
  onProgress(job: Job<JobQueueItem>, progress: number) {
    this.logger.debug(`Progress on job ${job.data.jobId}: ${progress}`);
  }

  @OnQueueCompleted()
  onComplete(job: Job<JobQueueItem>) {
    const payload = new JobCompletedEvent();

    payload.state = this.getWorkerState();
    payload.data = job.data;
    payload.returnValue = job.returnvalue;

    this.eventEmitter.emit(jobCompletedTopic, payload);
  }

  @OnQueueError()
  onError(error: Error) {
    this.logger.error('Got error', error.stack);
  }

  @OnQueueFailed()
  onFailed(job: Job<JobQueueItem>, error: Error | string) {
    const detail =
      error instanceof Error ? error.stack ?? error.message : error.toString();

    this.logger.error(`Error on job ${job.data.jobId}`, detail);
  }

  /**
   * Initialize the consumer storage from a job query
   * @param config job storage config
   */
  protected initializeStorage(config?: StorageConfig): void {
    this.storage = new Storage().addDrivers(new LocalStorage());

    if (config)
      this.storage.addDrivers(DriverFactory.getDriversFromConfig(config));
  }

  /**
   * Build an absolute URI for a file
   * @param filename file name to build a path for
   * @returns absolute URI for the file (file://)
   */
  protected makeLocalFilePath(filename: string): string {
    return join('file://', this.storageRoot, this.workingDirectory, filename);
  }
}
