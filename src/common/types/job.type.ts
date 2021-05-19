import {
  downloadQueueName,
  encodeQueueName,
  storeQueueName,
} from '../../config/queue';

export enum JobState {
  Download = 'download',
  Encode = 'encode',
  Store = 'store',
}

export const stateQueueMap: Map<JobState, string> = new Map<JobState, string>([
  [JobState.Download, downloadQueueName],
  [JobState.Encode, encodeQueueName],
  [JobState.Store, storeQueueName],
]);
