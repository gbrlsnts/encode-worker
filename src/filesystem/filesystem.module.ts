import { Module } from '@nestjs/common';
import { FileSystem } from './filesystem.service';
import { Storage } from './storage';

@Module({
  providers: [Storage, FileSystem],
  exports: [FileSystem],
})
export class FilesystemModule {}
