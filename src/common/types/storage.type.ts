import { HttpHeader } from './http.type';

export interface S3StorageConfig {
  enabled: boolean;
  endpoint: string;
  bucket: string;
  key: string;
  secret: string;
}

export interface FtpStorageConfig {
  enabled: boolean;
  uri: string;
  username: string;
  password: string;
}

export interface HttpStorageConfig {
  enabled: boolean;
  username: string;
  password: string;
  headers: HttpHeader[];
}

export interface StorageConfig {
  ftp?: FtpStorageConfig;
  s3?: S3StorageConfig;
  http?: HttpStorageConfig;
}
