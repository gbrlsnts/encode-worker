import { Injectable, Logger } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { OnEvent } from '@nestjs/event-emitter';
import {
  JobStartedEvent,
  JobCompletedEvent,
  jobCompletedTopic,
  jobStartedTopic,
} from '../common';

@Injectable()
export class WorkerEventsListener {
  private logger: Logger = new Logger(WorkerEventsListener.name);

  constructor(private managerService: ManagerService) {}

  @OnEvent(jobStartedTopic)
  async handleJobStarted(event: JobStartedEvent): Promise<void> {
    this.logger.log(
      `Job started: ${event.data.jobId}/${event.data.query.output.format} | ${event.state}`,
    );
  }

  @OnEvent(jobCompletedTopic)
  async handleJobCompleted(event: JobCompletedEvent): Promise<void> {
    this.logger.log(
      `Job completed ${event.data.jobId}/${event.data.query.output.format} | ${event.state}`,
    );

    await this.managerService.pushJobState(
      event.state,
      event.data,
      event.returnValue,
    );
  }
}
