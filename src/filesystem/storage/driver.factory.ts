import { StorageConfig } from '../../common';
import { StorageDriver } from './storage.driver.abstract';
import { S3Storage, FtpStorage, HttpStorage } from './drivers';

export class DriverFactory {
  /**
   * Create drivers from a configuration object
   * @param config
   * @returns
   */
  static getDriversFromConfig(config: StorageConfig): StorageDriver[] {
    const drivers = [];

    if (config.s3) {
      drivers.push(new S3Storage(config.s3));
    }

    if (config.ftp) {
      drivers.push(new FtpStorage(config.ftp));
    }

    if (config.http) {
      drivers.push(new HttpStorage(config.http));
    }

    return drivers;
  }
}
