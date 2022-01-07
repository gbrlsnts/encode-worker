import { Logger } from '@nestjs/common';
import { StorageInterface } from './storage.interface';
import { DriverInterface } from './driver.interface';

export abstract class StorageDriver
  implements StorageInterface, DriverInterface {
  /**
   * Logger instance
   */
  protected readonly logger: Logger;

  /**
   * The protocols this storage can handle
   */
  protected handledProtocols: string[] = [];

  constructor(protocols: string | string[]) {
    this.logger = new Logger(StorageDriver.name);

    this.handledProtocols.concat(
      typeof protocols === 'string' ? [protocols] : protocols,
    );
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
   * Get the supported protocols
   * @returns true if protocol is handled by this storage
   */
  protocols(): string[] {
    return this.handledProtocols;
  }

  /**
   * Check if this storage handles a protocol
   * @param protocol protocol to check
   * @returns true if protocol is handled by this storage
   */
  handles(protocol: string): boolean {
    return this.handledProtocols.includes(protocol);
  }

  /**
   * Validate a URI to use within the driver
   * @param uri uri to validate
   */
  validateUri(uri: string): void {
    for (const protocol in this.handledProtocols) {
      if (uri.startsWith(`${protocol}`)) return;
    }

    const handled = this.handledProtocols.join(', ');

    throw new Error(
      `Invalid storage URI. Must start with one of the following: ${handled}`,
    );
  }
}
