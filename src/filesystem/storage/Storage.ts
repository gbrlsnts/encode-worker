import { StorageInterface } from './storage.interface';
import { StorageDriver } from './storage.driver.abstract';
import { Injectable } from '@nestjs/common';
import { getProtocolFromUri } from '../../common';

@Injectable()
export class Storage implements StorageInterface {
  /**
   * The registered drivers
   */
  private _drivers: StorageDriver[] = [];

  /**
   * Constructor
   * @param drivers drivers to initialzie this storage with
   */
  constructor(drivers?: StorageDriver | StorageDriver[]) {
    this.addDrivers(drivers);
  }

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  getReadStream(uri: string): Promise<NodeJS.ReadableStream> {
    return this.getDriverOrFail(getProtocolFromUri(uri)).getReadStream(uri);
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  getWriteStream(uri: string): Promise<NodeJS.WritableStream> {
    return this.getDriverOrFail(getProtocolFromUri(uri)).getWriteStream(uri);
  }

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  delete(uri: string): Promise<void> {
    return this.getDriverOrFail(getProtocolFromUri(uri)).delete(uri);
  }

  /**
   * Get all enabled drivers
   */
  drivers(): StorageDriver[] {
    return this._drivers;
  }

  /**
   * Add one or more drivers
   * @param drivers
   */
  addDrivers(drivers: StorageDriver | StorageDriver[]): this {
    const driversArray = Array.isArray(drivers) ? drivers : [drivers];

    for (const drv of driversArray) this._addDriver(drv);

    return this;
  }

  /**
   * Add a driver
   * @param driver
   */
  private _addDriver(driver: StorageDriver): this {
    const allProtocols = this._drivers.reduce(
      (prev, drv) => prev.concat(drv.protocols()),
      [],
    );

    for (const handledProto in allProtocols)
      if (driver.protocols().includes(handledProto))
        throw new Error('Protocol is already being handled by a driver');

    this._drivers.push(driver);

    return this;
  }

  /**
   * Get the driver which handles a protocol
   * @param protocol protocol that a driver handles
   * @returns a driver
   */
  getDriver(protocol: string): StorageDriver | undefined {
    return this._drivers.find((storage) => storage.handles(protocol));
  }

  /**
   * Get the driver which handles a protocol or throw an error if not found
   * @param protocol protocol that a driver handles
   * @returns a driver or an error
   */
  getDriverOrFail(protocol: string): StorageDriver | undefined {
    const driver = this.getDriver(protocol);

    if (!driver) throw new Error('Protocol not supported');

    return driver;
  }
}
