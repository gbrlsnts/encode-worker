import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { encodeQueueName, sourcePathPrefix } from '../config/';
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
  providers: [sourcePathPrefix, EncodeService, EncodeConsumer],
})
export class EncodeModule {}
