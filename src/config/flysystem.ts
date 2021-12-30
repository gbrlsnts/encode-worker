import { join } from 'path';

export const rootDirectory = join(__dirname, '../../storage');

export const localConfig = {
  driver: 'local',
  config: {
    root: rootDirectory,
  },
};
