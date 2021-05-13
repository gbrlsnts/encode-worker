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

export enum LocationType {
  Local,
  Queued,
  S3,
  HTTP,
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
