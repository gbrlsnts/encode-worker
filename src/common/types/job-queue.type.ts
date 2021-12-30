import { DownloadResult } from './download.type';
import { EncodingOptions, EncodeResult } from './encode.type';
import { JobState } from './job.type';

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

export interface JobQuery {
  source: string;
  destination: JobDestinationDto;
  output: JobOutput;
}

export type JobOutput = EncodingOptions;

export interface JobDestinationDto {
  url: string;
  key: string;
  secret: string;
}
