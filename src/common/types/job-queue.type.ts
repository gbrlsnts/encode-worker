import { DownloadResult } from './download.type';
import { EncodingOptions, EncodeResult } from './encode.type';
import { JobState } from './job.type';
import { StorageConfig } from './storage.type';

export interface JobQueueItem {
  jobId: string;
  query: JobQuery;
}

export interface DownloadJobQueueItem extends JobQueueItem {
  state: JobState.Download;
  metadata: undefined;
}

export interface EncodeJobQueueItem extends JobQueueItem {
  state: JobState.Encode;
  metadata: DownloadResult;
}

export interface StoreJobQueueItem extends JobQueueItem {
  state: JobState.Store;
  metadata: EncodeResult;
}

export type WorkerJob =
  | DownloadJobQueueItem
  | EncodeJobQueueItem
  | StoreJobQueueItem;

export interface JobUrl {
  url: string;
}

export type JobUrlParams = JobUrl & StorageConfig;

export interface JobQuery {
  source: JobUrlParams;
  destination: JobUrlParams;
  output: JobOutput;
}

export type JobOutput = EncodingOptions;
