import { join } from 'path';

export const localConfig = {
  driver: 'local',
  config: {
    root: join(__dirname, '../../storage'),
  },
};
