import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DownloadService } from './download.service';
import { DownloadConsumer } from './download.consumer';
import { downloadQueueName, sourcePathPrefix } from '../config/';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: downloadQueueName,
      configKey: 'remote',
    }),
    FilesystemModule,
  ],
  providers: [sourcePathPrefix, DownloadConsumer, DownloadService],
})
export class DownloadModule {}
