import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { encodeQueueName, outputPathPrefix } from '../config/';
import { EncodeService } from './encode.service';
import { EncodeConsumer } from './encode.consumer';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: encodeQueueName,
    }),
    FilesystemModule,
  ],
  providers: [outputPathPrefix, EncodeService, EncodeConsumer],
})
export class EncodeModule {}
