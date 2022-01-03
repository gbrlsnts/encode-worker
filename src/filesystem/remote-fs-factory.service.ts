import { StorageManager, Storage } from '@slynova/flydrive';
import {
  AmazonWebServicesS3Storage,
  AmazonWebServicesS3StorageConfig,
} from '@slynova/flydrive-s3';
import {
  LocationType,
  S3ConnectionOptions,
  StorageConnectionOptions,
  RemoteLocationDriver,
} from './types';

export class RemoteFilesystemFactoryService {
  drivers: RemoteLocationDriver[] = [
    { type: LocationType.S3, name: 's3', driver: AmazonWebServicesS3Storage },
    { type: LocationType.FTP, name: 'ftp', driver: undefined },
  ];

  /**
   * Make a remote storage instance
   * @param connectionOptions options for that storage. eg.: credentials
   * @returns Storage
   */
  makeStorage(connectionOptions: StorageConnectionOptions): Storage {
    if (!this.isSupported(connectionOptions.type))
      throw new Error(`Unsupported location type: ${connectionOptions.type}`);

    this.validateOptions(connectionOptions, connectionOptions.type);

    const locationDriver = this.getLocationDriver(connectionOptions.type);

    let config;
    switch (connectionOptions.type) {
      case LocationType.S3:
        config = this.getS3Config(connectionOptions);
        break;
      case LocationType.FTP:
        config = this.getFtpConfig(connectionOptions);
        break;
      default:
        throw new Error(
          `Could not fetch remote config for location ${connectionOptions.type}`,
        );
    }

    const manager = new StorageManager({
      disks: {
        remote: {
          driver: locationDriver.name,
          config,
        },
      },
    });

    manager.registerDriver('s3', locationDriver.driver);

    return manager.disk('remote');
  }

  /**
   * Get the S3 connection configuration options
   * @param connectionOptions connection options
   * @returns s3 connection configuration
   */
  private getS3Config(
    connectionOptions: S3ConnectionOptions,
  ): AmazonWebServicesS3StorageConfig {
    return { ...connectionOptions.options, s3ForcePathStyle: true };
  }

  private getFtpConfig(connectionOptions): unknown {
    return undefined;
  }

  /**
   * Get the underlying driver for a location
   * @param type location type
   * @returns LocationDriver
   */
  getLocationDriver(type: LocationType): RemoteLocationDriver {
    return this.drivers.find((driver) => driver.type === type);
  }

  /**
   * Check if a location type is supported
   * @param type location type
   * @returns boolean
   */
  isSupported(type: LocationType): boolean {
    return this.getLocationDriver(type) !== undefined;
  }

  /**
   * Validate connection options
   * @param connectionOptions connection options
   * @param type storage type to validate
   */
  private validateOptions(
    connectionOptions: StorageConnectionOptions,
    type: LocationType,
  ): void {
    if (!connectionOptions)
      throw new Error(
        `Remote options must be provided for ${type} location type.`,
      );
  }
}
