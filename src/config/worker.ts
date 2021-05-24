import { ConfigService } from '@nestjs/config';

export const sourcePathprefixProvider = 'SOURCE_PATH_PREFIX';
export const outputPathprefixProvider = 'OUTPUT_PATH_PREFIX';

export const sourcePathPrefix = {
  provide: sourcePathprefixProvider,
  useFactory: (configService: ConfigService) =>
    configService.get('DOWNLOADED_FOLDER'),
  inject: [ConfigService],
};

export const outputPathPrefix = {
  provide: outputPathprefixProvider,
  useFactory: (configService: ConfigService) =>
    configService.get('ENCODED_FOLDER'),
  inject: [ConfigService],
};
