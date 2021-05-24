import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configSchema } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DownloadModule } from './download/download.module';
import { EncodeModule } from './encode/encode.module';
import { StorageModule } from './storage/storage.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { ManagerModule } from './manager/manager.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
    }),
    BullModule.forRootAsync('remote', {
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        prefix: configService.get<string>('QUEUE_PREFIX'),
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          db: configService.get<number>('REDIS_DB'),
          enableReadyCheck: true,
          autoResendUnfulfilledCommands: false,
          reconnectOnError: () => true,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        prefix: configService.get<string>('QUEUE_PREFIX'),
        redis: {
          host: configService.get<string>('LOCAL_REDIS_HOST'),
          port: configService.get<number>('LOCAL_REDIS_PORT'),
          db: configService.get<number>('LOCAL_REDIS_DB'),
          enableReadyCheck: true,
          autoResendUnfulfilledCommands: false,
          reconnectOnError: () => true,
        },
      }),
      inject: [ConfigService],
    }),
    DownloadModule,
    EncodeModule,
    StorageModule,
    FilesystemModule,
    ManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
