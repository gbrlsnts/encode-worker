import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { WorkerEventsListener } from './worker-events.listener';
import { encodeQueueName, storeQueueName } from '../config/';

@Module({
  imports: [
    BullModule.registerQueue({
      name: encodeQueueName,
    }),
    BullModule.registerQueue({
      name: storeQueueName,
    }),
  ],
  providers: [ManagerService, WorkerEventsListener],
})
export class ManagerModule {}
