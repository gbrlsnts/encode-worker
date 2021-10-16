import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageManager } from '@slynova/flydrive';
import { AmazonWebServicesS3Storage } from '@slynova/flydrive-s3';
import { localConfig } from '../config/flysystem';
import { flydriveProvider, queueStorageConfig, S3StorageConfig } from './types';
import { FileSystem } from './filesystem.service';
import { RemoteFilesystemFactoryService } from './remote-fs-factory.service';

@Module({
  providers: [
    {
      provide: queueStorageConfig,
      useFactory: (configService: ConfigService): S3StorageConfig => {
        return {
          endpoint: configService.get<string>('STORAGE_ENDPOINT'),
          bucket: configService.get<string>('STORAGE_BUCKET'),
          key: configService.get<string>('STORAGE_KEY'),
          secret: configService.get<string>('STORAGE_SECRET'),
        };
      },
      inject: [ConfigService],
    },
    {
      provide: flydriveProvider,
      useFactory: (queueStorageConfig: S3StorageConfig) => {
        const manager = new StorageManager({
          default: 'local',
          disks: {
            local: localConfig,
            queued: {
              driver: 's3',
              config: { ...queueStorageConfig, s3ForcePathStyle: true },
            },
          },
        });

        manager.registerDriver('s3', AmazonWebServicesS3Storage);

        return manager;
      },
      inject: [queueStorageConfig],
    },
    RemoteFilesystemFactoryService,
    FileSystem,
  ],
  exports: [FileSystem],
})
export class FilesystemModule {}
