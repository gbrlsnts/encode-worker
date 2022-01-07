import { Injectable } from '@nestjs/common';
import { StorageConfig } from './../common';
import { Storage, DriverFactory } from './storage';

@Injectable()
export class FileSystem {
  constructor(protected storage: Storage, options?: StorageConfig) {
    this.storage.addDrivers(DriverFactory.getDriversFromConfig(options));
  }

  /**
   * Download a file from a remote url to a local path.
   * @param remoteUrl
   * @param localPath
   */
  async download(remoteUrl: string, localPath: string): Promise<void> {
    const readStream = await this.storage.getReadStream(remoteUrl);
    const writeStream = await this.storage.getWriteStream(localPath);

    this.pipe(readStream, writeStream);
  }

  /**
   * Upload a file from a local path to a remote path.
   * @param remoteUrl
   * @param localPath
   */
  async upload(localPath: string, remoteUrl: string): Promise<void> {
    const readStream = await this.storage.getReadStream(localPath);
    const writeStream = await this.storage.getWriteStream(remoteUrl);

    this.pipe(readStream, writeStream);
  }

  /**
   * Pipe a read stream into a write stream and handle errors
   * @param read
   * @param write
   */
  private pipe(
    read: NodeJS.ReadableStream,
    write: NodeJS.WritableStream,
  ): void {
    // todo: error handling on stream events
    read.pipe(write);
  }

  /**
   * Delete a file from a path
   * @param path

   */
  async delete(path: string): Promise<void> {
    return this.storage.delete(path);
  }
}
