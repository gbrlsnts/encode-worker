import { HttpConfig } from './http.type';

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

export interface HttpStorageConfig {
  uri: string;
  username: string;
  password: string;
}

export interface StorageConfig {
  ftp?: FtpStorageConfig;
  s3?: S3StorageConfig;
  http?: HttpConfig;
}
