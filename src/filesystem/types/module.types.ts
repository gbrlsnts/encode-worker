export const flydriveProvider = 'FLYDRIVE_MANAGER';
export const queueStorageConfig = 'QUEUE_STORAGE_CONFIG';

export enum DriveStorage {
  Local = 'local',
  Queued = 'queued',
}

export interface S3StorageConfig {
  endpoint: string;
  bucket: string;
  key: string;
  secret: string;
}

export interface FtpStorageConfig {
  uri: string;
  username: string;
  password: string;
}

export enum LocationType {
  Local,
  Queued,
  S3,
  FTP,
}

export interface Location {
  type: LocationType;
  path: string;
  protocol?: string;
  host?: string;
  bucket?: string;
  object: string;
}

export interface DefaultConnectionOptions {
  type: LocationType.Local | LocationType.Queued | LocationType.FTP;
}

export interface S3ConnectionOptions {
  type: LocationType.S3;
  options: S3StorageConfig;
}

export interface FtpConnectionOptions {
  type: LocationType.FTP;
  options: FtpStorageConfig;
}

export type StorageConnectionOptions =
  | DefaultConnectionOptions
  | S3ConnectionOptions
  | FtpConnectionOptions;

export interface FileOperationOptions {
  key: string;
  secret: string;
}

export interface RemoteLocationDriver {
  type: LocationType;
  name: string;
  driver: any; // can't declare the correct interface due to being private within the module
}
