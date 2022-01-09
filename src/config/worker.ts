import { ConfigService } from '@nestjs/config';

export const SOURCE_PATH = 'SOURCE_PATH_PREFIX';
export const OUTPUT_PATH = 'OUTPUT_PATH_PREFIX';

export const sourcePathPrefix = {
  provide: SOURCE_PATH,
  useFactory: (configService: ConfigService) =>
    configService.get('DOWNLOADED_FOLDER'),
  inject: [ConfigService],
};

export const outputPathPrefix = {
  provide: OUTPUT_PATH,
  useFactory: (configService: ConfigService) =>
    configService.get('ENCODED_FOLDER'),
  inject: [ConfigService],
};
