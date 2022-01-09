import { Module } from '@nestjs/common';
import { FileSystem } from './filesystem.service';
import { Storage } from './storage';

@Module({
  providers: [
    {
      provide: 'STORAGE',
      useFactory: () => new Storage(),
    },
    FileSystem,
  ],
  exports: [FileSystem],
})
export class FilesystemModule {}
