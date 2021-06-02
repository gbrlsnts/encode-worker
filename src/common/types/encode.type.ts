export enum OutputFormat {
  mp4 = 'mp4',
  thumbnail = 'thumbnail',
}

export enum OutputVideoCodec {
  libx264 = 'libx264',
  libx265 = 'libx265',
}

export enum OutputAudioCodec {
  aac = 'aac',
  libfdk_aac = 'libfdk_aac',
}

export interface EncodingOptions {
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

export interface EncodeResult {
  path: string;
}
