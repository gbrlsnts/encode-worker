import { StorageManager, Storage } from '@slynova/flydrive';
import { AmazonWebServicesS3Storage } from '@slynova/flydrive-s3';
import {
  LocationType,
  S3ConnectionOptions,
  StorageConnectionOptions,
} from './types';

export class RemoteFilesystemFactoryService {
  /**
   * Make a remote storage instance
   * @param remoteOpts options for that storage. eg.: credentials
   * @returns Storage
   */
  makeStorage(remoteOpts: StorageConnectionOptions): Storage {
    // maybe abstract this later
    switch (remoteOpts.type) {
      case LocationType.S3:
        return this.makeS3(remoteOpts);
      default:
        throw new Error(`Unsupported location type: ${remoteOpts.type}`);
    }
  }

  private makeS3(remoteOpts: S3ConnectionOptions): Storage {
    if (!remoteOpts)
      throw new Error(`Remote options must be provided for S3 location type.`);

    const type = LocationType.S3;

    if (remoteOpts.type !== type)
      throw new Error(
        `No connection options available. Required: ${type}. Provided: ${remoteOpts.type}`,
      );

    const manager = new StorageManager({
      disks: {
        remote: {
          driver: 's3',
          config: { ...remoteOpts.options, s3ForcePathStyle: true },
        },
      },
    });

    manager.registerDriver('s3', AmazonWebServicesS3Storage);

    return manager.disk('remote');
  }
}
