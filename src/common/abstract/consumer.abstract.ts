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
  getBaseProtoByUri,
  JobCompletedEvent,
  jobCompletedTopic,
  JobQueueItem,
  JobStartedEvent,
  jobStartedTopic,
  JobState,
  rtrimChar,
  StorageConfig,
} from '../../common';
import { FileSystem } from '../../filesystem/';
import { rootDirectory } from '../../config/';
import { JobUrlParams } from '../types/job-queue.type';

export abstract class WorkerConsumer {
  protected readonly logger: Logger;

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
   * Build an absolute URI for a file
   * @param filename file name to build a path for
   * @returns absolute URI for the file (file://)
   */
  protected makeLocalFilePath(filename: string): string {
    return 'file://' + join(this.storageRoot, this.workingDirectory, filename);
  }

  /**
   * Injects necessary metadata from the job info into the config objects
   * @param params data to get data to inject
   */
  protected injectConfigMetadata(params: JobUrlParams): void {
    const proto = getBaseProtoByUri(params.url);

    if (params[proto]) {
      params[proto].enabled = true;
    } else {
      params[proto] = { enabled: true };
    }
  }
}

export interface StorageOptions {
  filesystem: FileSystem;
  config: StorageConfig;
}
