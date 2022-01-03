import { StorageInterface } from './StorageInterface';
import { LocalStorage } from './drivers/LocalStorage';

export class Storage implements StorageInterface {
  /**
   * The registered drivers per protocol
   */
  private _drivers: Record<string, StorageInterface> = {
    file: new LocalStorage(), // provide file as default
  };

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  getReadStream(uri: string): Promise<NodeJS.ReadableStream> {
    return this.getDriverOrFail(this.parseProtocol(uri)).getReadStream(uri);
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  getWriteStream(uri: string): Promise<NodeJS.WritableStream> {
    return this.getDriverOrFail(this.parseProtocol(uri)).getWriteStream(uri);
  }

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  delete(uri: string): Promise<void> {
    return this.getDriverOrFail(this.parseProtocol(uri)).delete(uri);
  }

  /**
   * Get all enabled drivers
   */
  get drivers(): Record<string, StorageInterface> {
    return this._drivers;
  }

  /**
   * Add a driver
   * @param protocol
   * @param driver
   */
  addDriver(protocol: string, driver: StorageInterface): void {
    if (this.getDriver(protocol) !== undefined)
      throw new Error('Protocol is already being handled by a driver');

    this._drivers[protocol] = driver;
  }

  /**
   * Get the driver which handles a protocol
   * @param protocol protocol that a driver handles
   * @returns a driver
   */
  getDriver(protocol: string): StorageInterface | undefined {
    return this._drivers[protocol];
  }

  /**
   * Get the driver which handles a protocol or throw an error if not found
   * @param protocol protocol that a driver handles
   * @returns a driver or an error
   */
  getDriverOrFail(protocol: string): StorageInterface | undefined {
    const driver = this.getDriver(protocol);

    if (!driver) throw new Error('Protocol not supported');

    return driver;
  }

  /**
   * Parse a protocol from an uri
   * @param uri uri to parse
   * @returns protocol
   */
  private parseProtocol(uri: string): string {
    const delimiter = uri.indexOf(':');

    if (delimiter === -1) throw new Error('Unable to parse protocol');

    return uri.substring(0, delimiter);
  }
}