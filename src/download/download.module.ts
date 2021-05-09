import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DownloadService } from './download.service';
import { DownloadConsumer } from './download.consumer';
import { downloadQueue } from '../config/';

@Module({
  imports: [
    BullModule.registerQueue({
      name: downloadQueue,
    }),
  ],
  providers: [DownloadConsumer, DownloadService],
})
export class DownloadModule {}
