import * as pathToFfmpeg from 'ffmpeg-static';
import { path as pathToFfprobe } from 'ffprobe-static';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegOnProgress from 'ffmpeg-on-progress';
import { mkdir } from 'fs';
import { sep } from 'path';
import { Observable, Subject, defer } from 'rxjs';
import { Logger } from '@nestjs/common';
import { EncodingOptions } from '../common/';

export class Encoder {
  private readonly logger: Logger = new Logger(Encoder.name);

  private hasRan = false;

  constructor(
    private readonly options: EncodingOptions,
    private readonly source: string,
    private readonly destination: string,
  ) {
    ffmpeg.setFfmpegPath(pathToFfmpeg);
    ffmpeg.setFfprobePath(pathToFfprobe);
  }

  /**
   * Prepare to run the encoding acording the provided options.
   * It only runs when a subscriber is attached to the observable.
   */
  run(): Observable<number> {
    this.createOutputDir();

    const observable = new Subject<number>();
    const duration = this.getInputDuration();

    const cmd = ffmpeg()
      .input(this.source)
      .output(this.destination)
      .videoCodec(this.options.videocodec || 'libx264')
      .on('codecData', (data) =>
        this.logger.debug(`Codec data: ${data.video}/${data.audio}`),
      )
      .on('start', (cmd) => this.logger.debug(`Spawned ffmpeg: ${cmd}`))
      .on(
        'progress',
        ffmpegOnProgress(
          (progress) => observable.next(Math.round(progress * 100)),
          duration,
        ),
      )
      .on('error', (err) => observable.error(err))
      .on('end', () => observable.complete());

    return defer(() => {
      if (!this.hasRan) {
        cmd.run();
        this.hasRan = true;
      }

      return observable;
    });
  }

  private async createOutputDir(): Promise<void> {
    const lastSep = this.destination.lastIndexOf(sep);
    const folder = this.destination.substring(0, lastSep);

    return new Promise((resolve, reject) => {
      mkdir(folder, { recursive: true }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  private async getInputDuration(): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg(this.source).ffprobe((err, data) => {
        if (err) return reject(err);
        resolve(data.format.duration);
      });
    });
  }
}
