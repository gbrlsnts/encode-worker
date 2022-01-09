import { type as osType } from 'os';

export const nullDescriptor = osType() === 'Windows_NT' ? 'NUL' : '/dev/null';

export const replaceFileProtocol = (uri: string) => uri.replace('file://', '');
