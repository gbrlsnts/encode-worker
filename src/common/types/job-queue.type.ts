import {
  OutputAudioCodec,
  OutputFormat,
  OutputVideoCodec,
} from './encode.type';

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

export interface JobOutput {
  format: OutputFormat;
  videocodec?: OutputVideoCodec;
  videoBitrate?: number;
  crf?: number;
  width?: number;
  height?: number;
  twoPass?: boolean;
  audioCodec?: OutputAudioCodec;
  audioBitrate?: number;
}

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
