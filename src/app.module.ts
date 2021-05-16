import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: __dirname + '/../data/worker.sqlite',
        entities: [__dirname + '/**/*.entity.{js,ts}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        prefix: configService.get<string>('QUEUE_PREFIX'),
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
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
