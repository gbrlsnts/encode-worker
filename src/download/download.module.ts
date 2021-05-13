import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DownloadService } from './download.service';
import { DownloadConsumer } from './download.consumer';
import { downloadQueue } from '../config/';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: downloadQueue,
    }),
    FilesystemModule,
  ],
  providers: [DownloadConsumer, DownloadService],
})
export class DownloadModule {}
