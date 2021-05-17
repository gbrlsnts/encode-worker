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

    await this.managerService.saveJob({
      externalId: event.data.jobId.toString(10),
      queue: event.state,
      priority: event.data.metadata?.priority,
      reservedAt: new Date(),
      data: JSON.stringify(event.data),
    });
  }

  @OnEvent(jobCompletedTopic)
  async handleJobCompleted(event: JobCompletedEvent): Promise<void> {
    this.logger.log(
      `Job completed ${event.data.jobId}/${event.data.query.output.format} | ${event.state}`,
    );

    const nextState = this.managerService.getNextState(event.state);
    const isLastState = this.managerService.isLastState(event.state);

    await this.managerService.saveJob({
      externalId: event.data.jobId.toString(10),
      queue: nextState ?? event.state,
      reservedAt: null,
      completedAt: isLastState ? new Date() : null,
      data: JSON.stringify(event.data),
    });
  }
}
