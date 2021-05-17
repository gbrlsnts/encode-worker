import { JobState } from '../../common';

export class SaveJobDto {
  externalId: string;
  queue: JobState;
  priority?: number;
  reservedAt?: Date;
  completedAt?: Date;
  data: string;
}
