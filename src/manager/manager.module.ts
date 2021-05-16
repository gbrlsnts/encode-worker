import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagerService } from './manager.service';
import { JobRepository } from './job.repository';
import { WorkerEventsListener } from './worker-events.listener';

@Module({
  imports: [TypeOrmModule.forFeature([JobRepository])],
  providers: [ManagerService, WorkerEventsListener],
})
export class ManagerModule {}
