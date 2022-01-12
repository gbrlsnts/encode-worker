import { Injectable } from '@nestjs/common';
import { Storage } from './storage';

@Injectable()
export class FileSystemGateway {
  constructor(protected storage: Storage) {}

  /**
   * Download a file from a remote url to a local path.
   * @param remoteUrl
   * @param localPath
   */
  async download(remoteUrl: string, localPath: string): Promise<void> {
    const readStream = await this.storage.getReadStream(remoteUrl);
    const writeStream = await this.storage.getWriteStream(localPath);

    await this.pipe(readStream, writeStream);
  }

  /**
   * Upload a file from a local path to a remote path.
   * @param remoteUrl
   * @param localPath
   */
  async upload(localPath: string, remoteUrl: string): Promise<void> {
    const readStream = await this.storage.getReadStream(localPath);
    const writeStream = await this.storage.getWriteStream(remoteUrl);

    await this.pipe(readStream, writeStream);
  }

  /**
   * Pipe a read stream into a write stream and handle errors
   * @param read
   * @param write
   */
  private pipe(
    read: NodeJS.ReadableStream,
    write: NodeJS.WritableStream,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      read.on('error', (e) => reject(e));

      write.on('error', (e) => reject(e));
      write.on('close', () => resolve());

      read.pipe(write);
    });
  }

  /**
   * Delete a file from a path
   * @param path

   */
  async delete(path: string): Promise<void> {
    return this.storage.delete(path);
  }
}
