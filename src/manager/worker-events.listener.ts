import { Injectable } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { OnEvent } from '@nestjs/event-emitter';
import { JobCompletedEvent, jobCompletedTopic } from '../common';

@Injectable()
export class WorkerEventsListener {
  constructor(private managerService: ManagerService) {}

  @OnEvent(jobCompletedTopic)
  handleJobCompleted(event: JobCompletedEvent): void {
    // this.managerService.pushJobState();
    console.log('got event', event);
  }
}
