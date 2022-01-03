import { createReadStream, createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { StorageDriver } from '../StorageDriver';

/**
 * Local storage driver. All URIs should start with file://
 */
export class LocalStorage extends StorageDriver {
  constructor() {
    super('file');
  }

  /**
   * Get the underlying driver - not used in LocalStorage, returns undefined.
   */
  driver(): void {
    return;
  }

  /**
   * Clean-up the underlying driver - not used in LocalStorage
   */
  async destroy(): Promise<void> {
    return;
  }

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  async getReadStream(uri: string): Promise<NodeJS.ReadableStream> {
    this.validateUri(uri);

    return createReadStream(uri);
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  async getWriteStream(uri: string): Promise<NodeJS.WritableStream> {
    this.validateUri(uri);

    return createWriteStream(uri);
  }

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  async delete(uri: string): Promise<void> {
    this.validateUri(uri);

    await unlink(uri);
  }
}
