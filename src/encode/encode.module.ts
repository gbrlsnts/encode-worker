import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncodeService } from './encode.service';
import { encodeQueueName } from '../config/queue';
import { EncodeConsumer } from './encode.consumer';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: encodeQueueName,
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
    EncodeService,
    EncodeConsumer,
  ],
})
export class EncodeModule {}
