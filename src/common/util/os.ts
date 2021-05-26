import { type as osType } from 'os';

export const nullDescriptor = osType() === 'Windows_NT' ? 'NUL' : '/dev/null';
