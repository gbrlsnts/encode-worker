export interface HttpHeader {
  key: string;
  value: string;
}

export const protoAliases: Record<string, string[]> = {
  s3: ['s3'],
  ftp: ['ftp', 'ftps'],
  http: ['http', 'https'],
};
