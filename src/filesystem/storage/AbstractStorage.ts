import { Logger } from '@nestjs/common';
import { StorageInterface } from './StorageInterface';

export abstract class AbstractStorage implements StorageInterface {
  protected readonly logger: Logger;
  protected protoStringStart: string;

  constructor(protected protocol: string) {
    this.logger = new Logger(AbstractStorage.name);
    this.protoStringStart = `${this.protocol}://`;
  }

  /**
   * Get the underlying driver
   */
  abstract driver(): any;

  /**
   * Clean-up the underlying driver
   */
  abstract destroy(): Promise<void>;

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getReadStream(uri: string): Promise<NodeJS.ReadableStream> {
    throw new Error('Method not supported');
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getWriteStream(uri: string): Promise<NodeJS.WritableStream> {
    throw new Error('Method not supported');
  }

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(uri: string): Promise<void> {
    throw new Error('Method not supported');
  }

  /**
   * Validate a URI to use within the driver
   * @param uri uri to validate
   */
  validateUri(uri: string): void {
    if (!uri.startsWith(`${this.protoStringStart}`))
      throw new Error(
        `Invalid storage URI. Must start with ${this.protoStringStart}`,
      );
  }
}
