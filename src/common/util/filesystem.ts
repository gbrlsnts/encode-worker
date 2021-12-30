import { mkdir, access } from 'fs/promises';

export const createDirectoryRecursive = (path: string): Promise<string> =>
  mkdir(path, { recursive: true });

export const directoryExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);

    return true;
  } catch (error) {
    return false;
  }
};
