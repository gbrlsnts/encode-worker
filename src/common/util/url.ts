import { protoAliases } from '../types/';

export const getProtocolFromUri = (uri: string): string | undefined => {
  const delimiter = uri.indexOf(':');

  if (delimiter < 0) return;

  return uri.substring(0, delimiter);
};

export const getBaseProtoByAlias = (alias: string): string | undefined => {
  for (const key in protoAliases) {
    if (protoAliases[key].includes(alias)) return key;
  }
};

export const getBaseProtoByUri = (uri: string): string | undefined => {
  const alias = getProtocolFromUri(uri);

  return getBaseProtoByAlias(alias);
};
