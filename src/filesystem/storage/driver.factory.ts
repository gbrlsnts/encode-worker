import { StorageConfig } from '../../common';
import { StorageDriver } from './storage.driver.abstract';
import { S3Storage, FtpStorage, HttpStorage } from './drivers';

export class DriverFactory {
  /**
   * Create drivers from a configuration object
   * @param config config to create drivers from
   * @param drivers drivers to include independently of the config settings
   * @returns all drivers
   */
  static getDriversFromConfig(
    config: StorageConfig,
    drivers: StorageDriver[] = [],
  ): StorageDriver[] {
    if (config.s3?.enabled) {
      drivers.push(new S3Storage(config.s3));
    }

    if (config.ftp?.enabled) {
      drivers.push(new FtpStorage(config.ftp));
    }

    if (config.http?.enabled) {
      drivers.push(new HttpStorage(config.http));
    }

    return drivers;
  }
}
