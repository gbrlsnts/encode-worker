import { Client, FTPError } from 'basic-ftp';
import { PassThrough } from 'stream';
import { Logger } from '@nestjs/common';
import { FtpStorageConfig } from '../../types';
import { StorageDriver } from '../StorageDriver';

export class FtpStorage extends StorageDriver {
  protected readonly logger: Logger;

  private $driver: Client;
  private connected = false;

  constructor(private config: FtpStorageConfig, private secure = false) {
    super(['ftp', 'ftps']);

    this.logger = new Logger(FtpStorage.name);

    this.$driver = new Client();
  }

  /**
   * Get the underlying driver.
   */
  driver(): Client {
    return this.$driver;
  }

  /**
   * Clean-up the underlying driver
   */
  async destroy(): Promise<void> {
    this.$driver.close();
  }

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  async getReadStream(uri: string): Promise<NodeJS.ReadableStream> {
    await this.runPreOperationChecks(uri);

    const stream = new PassThrough();

    await this.$driver.downloadTo(stream, this.getPath(uri));

    return stream;
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  async getWriteStream(uri: string): Promise<NodeJS.WritableStream> {
    await this.runPreOperationChecks(uri);

    const stream = new PassThrough();

    await this.$driver.uploadFrom(stream, this.getPath(uri));

    return stream;
  }

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  async delete(uri: string): Promise<void> {
    await this.runPreOperationChecks(uri);

    await this.$driver.remove(this.getPath(uri));
  }

  /**
   * Returns the underlying driver connection state
   */
  get isConnected() {
    return this.connected;
  }

  /**
   * Run some checks common to all operations (uri validation, connect, etc)
   * @param uri to validate
   */
  protected runPreOperationChecks(uri: string): Promise<void> {
    this.validateUri(uri);

    return this.connect();
  }

  /**
   * Get a ftp-useable path from a URI
   * @param uri uri to get the path from
   * @returns a path
   */
  protected getPath(uri: string): string {
    // replaces the proto identification (e.g. ftp://)
    return uri.replace(/^[\w+]+:\/\/.*$/i, '');
  }

  protected async connect(): Promise<void> {
    if (this.connected) return;

    const uri = new URL(this.config.uri);

    await this.$driver.access({
      host: uri.hostname,
      port: Number(uri.port) || 21,
      user: this.config.username,
      password: this.config.password,
      secure: this.secure,
    });

    this.connected = true;
  }

  /**
   * Handles errors from the underlying driver
   * @param error the thrown error
   */
  protected handleFtpError(error: any): void {
    if (error instanceof FTPError) {
      this.logger.error(`${error.message}  [Code: ${error.code}]`, error.stack);
    } else if (error instanceof Error) {
      // Error is thrown when the connection is lost
      this.logger.error(error.message, error.stack);
      this.connected = false;
    } else {
      this.logger.error(error.message, error.stack);
    }
  }
}
