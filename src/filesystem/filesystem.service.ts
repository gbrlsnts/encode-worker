import { Injectable } from '@nestjs/common';
import { StorageConfig } from './../common';
import { Storage, DriverFactory, LocalStorage } from './storage';
import { FileSystemGateway } from './filesystem-gateway.service';

@Injectable()
export class FileSystem {
  /**
   * Get the storage gateway
   * @param config storage configurations
   * @returns storage gateway for the desired config
   */
  getGateway(config: StorageConfig): FileSystemGateway {
    const baseDrivers = [new LocalStorage()];
    const drivers = DriverFactory.getDriversFromConfig(config, baseDrivers);

    return new FileSystemGateway(new Storage(drivers));
  }
}
