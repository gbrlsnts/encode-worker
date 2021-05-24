import { URL } from 'url';
import { join } from 'path';
import { Inject, Injectable } from '@nestjs/common';
import { localConfig } from '../config/flysystem';
import {
  StorageManager,
  Storage,
  LocalFileSystemStorage,
} from '@slynova/flydrive';
import {
  DriveStorage,
  flydriveProvider,
  // lint complains about not used even though its not true
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  queueStorageConfig,
  LocationType,
  Location,
  S3StorageConfig,
} from './types';

@Injectable()
export class FileSystem {
  private readonly localStorage: Storage;
  private readonly remoteStorage: Storage;
  private readonly locationTypeMap: Map<LocationType, Storage>;

  private queuedHost: string;

  constructor(
    @Inject(flydriveProvider)
    manager: StorageManager,
    @Inject(queueStorageConfig)
    queueStorageConfig: S3StorageConfig,
  ) {
    this.localStorage = manager.disk(DriveStorage.Local);
    this.remoteStorage = manager.disk(DriveStorage.Queued);

    this.locationTypeMap = new Map([
      [LocationType.Local, this.localStorage],
      [LocationType.Queued, this.remoteStorage],
    ]);

    this.queuedHost = new URL(queueStorageConfig.endpoint).host;
  }

  /**
   * Get the absolute path in a location from its relative path
   * @param relative relative path
   * @param location location to get the absolute path
   * @returns the absolute path
   */
  getAbsolutePath(relative: string, location: LocationType): string {
    if (location === LocationType.Local) {
      return join(localConfig.config.root, relative);
    }

    return this.getStorageByLocationType(location).getUrl(relative);
  }

  /**
   * Download a file from a remote url to a local path.
   * If the URLs match either the configured local or queued job storage, it will use it, otherwise will try to connect and fetch.
   * @param remoteUrl
   * @param localPath
   */
  async download(remoteUrl: string, localPath: string): Promise<void> {
    const parsed = this.parseLocation(remoteUrl);
    const storage = this.getStorageByLocationType(parsed.type);

    const stream = await this.getStreamSafe(storage, parsed.object);
    await this.localStorage.put(localPath, stream);
  }

  /**
   * Upload a file from a local path to a remote path.
   * If the URLs match either the configured local or queued job storage, it will use it, otherwise will try to connect and upload.
   * @param remoteUrl
   * @param localPath
   */
  async upload(localPath: string, remoteUrl: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  /**
   * Delete a file from a path
   * If the URL match either the configured local or queued job storage, it will use it, otherwise will try to connect and delete.
   * @param remoteUrl
   * @param path
   */
  async delete(path: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  /**
   * Wrapper to get a stream and throw an exception if there's an error
   * @param storage
   * @param location
   * @returns a readable stream
   */
  async getStreamSafe(
    storage: Storage,
    location: string,
  ): Promise<NodeJS.ReadableStream> {
    return new Promise((resolve, reject) => {
      const stream = storage.getStream(location);

      stream.once('readable', () => resolve(stream));
      stream.on('error', (e) => reject(e));
    });
  }

  /**
   * Parse a URL location into a Location object
   * @param location
   * @returns Location
   */
  parseLocation(location: string): Location {
    if (location.startsWith('/'))
      return {
        type: LocationType.Local,
        path: this.normalizeLocationPath(location),
        object: this.normalizeLocationPath(location),
      };

    const url = new URL(location);
    const protocol = url.protocol.replace(':', '');

    const type =
      url.host === this.queuedHost
        ? LocationType.Queued
        : this.mapProtocolToLocationType(protocol);

    const slashSplit = this.normalizeLocationPath(url.pathname)
      .substring(1)
      .split('/');

    const bucket =
      type == LocationType.Queued || LocationType.S3
        ? slashSplit?.[0]
        : undefined;

    const object =
      type == LocationType.Queued || LocationType.S3
        ? slashSplit.slice(1).join('/')
        : this.normalizeLocationPath(url.pathname);

    return {
      type,
      protocol,
      host: url.host,
      path: this.normalizeLocationPath(url.pathname),
      bucket,
      object,
    };
  }

  /**
   * Map a protocol to a LocationType
   * @param protocol
   * @returns LocationType
   */
  mapProtocolToLocationType(protocol: string): LocationType {
    switch (protocol) {
      case 's3':
        return LocationType.S3;
      case 'http':
      case 'https':
        return LocationType.HTTP;
      case 'ftp':
      case 'ftps':
        return LocationType.FTP;
      default:
        throw new Error(`Unsupported protocol: ${protocol}`);
    }
  }

  /**
   * Get a storage by a LocationType
   * @param type
   * @returns Storage
   */
  getStorageByLocationType(type: LocationType): Storage {
    const mapped = this.locationTypeMap.get(type);

    if (mapped) return mapped;

    throw new Error(`Unsupported location type: ${type}`);
  }

  /**
   * Normalize a path - removes any url encoding
   * @param path
   * @returns
   */
  private normalizeLocationPath(path: string): string {
    return decodeURIComponent(path);
  }
}
