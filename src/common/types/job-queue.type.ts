import { EncodingOptions } from './encode.type';

export interface JobQueueItem {
  jobId: number;
  query: JobQuery;
  metadata: WorkerMetadata;
}

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

export interface WorkerMetadata {
  localFilesId: string;
  sourcePath: string;
  priority: number;
}
