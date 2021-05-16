import { Injectable } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { JobCompletedEvent } from '../common/events/job-completed.event';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WorkerEventsListener {
  constructor(private managerService: ManagerService) {}

  @OnEvent('job.completed')
  handleJobCompleted(event: JobCompletedEvent): void {
    // this.managerService.pushJobState();
    console.log('got event', event);
  }
}
