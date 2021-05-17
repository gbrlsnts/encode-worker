import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  providers: [
    {
      provide: 'SOURCE_PREFIX',
      useFactory: (configService: ConfigService) =>
        configService.get('DOWNLOADED_FOLDER'),
      inject: [ConfigService],
    },
    DownloadConsumer,
    DownloadService,
  ],
})
export class DownloadModule {}
