import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DownloadModule } from './download/download.module';
import { EncodeModule } from './encode/encode.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [DownloadModule, EncodeModule, StorageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
