import { Module } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { WorkerEventsListener } from './worker-events.listener';

@Module({
  providers: [ManagerService, WorkerEventsListener],
})
export class ManagerModule {}
