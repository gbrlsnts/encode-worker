import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { storeQueueName } from '../config/queue';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { StorageConsumer } from './storage.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: storeQueueName,
    }),
    FilesystemModule,
  ],
  providers: [StorageConsumer],
})
export class StorageModule {}
