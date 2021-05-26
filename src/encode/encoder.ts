import * as pathToFfmpeg from 'ffmpeg-static';
import { path as pathToFfprobe } from 'ffprobe-static';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegOnProgress from 'ffmpeg-on-progress';
import { mkdir } from 'fs';
import { sep } from 'path';
import { Observable, Subject, defer, concat } from 'rxjs';
import { Logger } from '@nestjs/common';
import { EncodingOptions, nullDescriptor } from '../common/';
import { TwoPassOptions } from './encode.type';

export class Encoder {
  private readonly logger: Logger = new Logger(Encoder.name);

  private duration: number;
  private pipeline: Observable<number>;

  constructor(
    private readonly options: EncodingOptions,
    private readonly source: string,
    private readonly destination: string,
    private readonly passLogFile: string,
  ) {
    ffmpeg.setFfmpegPath(pathToFfmpeg);
    ffmpeg.setFfprobePath(pathToFfprobe);
  }

  /**
   * Prepare to run the encoding acording the provided options.
   * It only runs when a subscriber is attached to the observable.
   */
  run(): Observable<number> {
    if (this.pipeline) return this.pipeline;

    this.createOutputDir();

    return defer(() => {
      this.pipeline = concat(...this.getObservableCommands());

      return this.pipeline;
    });
  }

  /**
   * Get all commands to run (one pass or two pass) with events
   * @returns list of commands
   */
  private getObservableCommands(): Observable<number>[] {
    if (!this.options?.twoPass) return [this.getCommand()];

    return [1, 2].map((pass) =>
      this.getCommand({
        enabled: true,
        pass,
      }),
    );
  }

  /**
   * Get the ffmpeg command to execute
   * @param twoPass two pass options
   * @returns ffmpeg command
   */
  private getCommand(twoPass?: TwoPassOptions): Observable<number> {
    const observable = new Subject<number>();
    const duration = this.getInputDuration();
    const currentPass = twoPass?.pass || 1;

    const cmd = ffmpeg().input(this.source).format(this.options.format);

    this.mapOptionsToCommand(cmd);

    // if two pass set its options, or just set the output otherwise
    if (twoPass?.enabled && twoPass.pass)
      this.setTwoPassOptions(cmd, currentPass);
    else cmd.output(this.destination);

    // attach events
    cmd
      .on('codecData', (data) =>
        this.logger.debug(`Codec data: ${data.video}/${data.audio}`),
      )
      .on('start', (cmd) => this.logger.debug(`Spawned ffmpeg: ${cmd}`))
      .on(
        'progress',
        ffmpegOnProgress(
          (progress) =>
            observable.next(
              this.calculateProgress(
                progress,
                currentPass,
                twoPass.enabled ? 2 : 1,
              ),
            ),
          duration,
        ),
      )
      .on('error', (err, stdout, stderr) => {
        if (stdout) this.logger.debug(stderr);
        if (stderr) this.logger.debug(stderr);
        observable.error(err);
      })
      .on('end', () => {
        observable.complete();
      });

    return defer(() => {
      cmd.run();
      return observable;
    });
  }

  /**
   * Set some options on the ffmpeg command
   * @param cmd the command to set options
   */
  private mapOptionsToCommand(cmd: ffmpeg.FfmpegCommand): void {
    const setterMap = new Map<any, string>([
      [this.options.videocodec, 'videoCodec'],
      [this.options.audioCodec, 'audioCodec'],
      [this.options.videoBitrate, 'videoBitrate'],
    ]);

    // set the options if they are defined
    for (const [value, setter] of setterMap.entries())
      if (value) cmd[setter](value);
  }

  /**
   * Set two pass options
   * @param cmd the command to set options
   */
  private setTwoPassOptions(cmd: ffmpeg.FfmpegCommand, pass: number): void {
    if (pass === 1) cmd.output(nullDescriptor).noAudio();
    if (pass === 2) cmd.output(this.destination);

    cmd.withOption(['-pass', pass.toString()]);
    cmd.withOption(['-passlogfile', this.passLogFile]);
  }

  /**
   * Create the output directory
   */
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

  /**
   * Get the input duration in ms. Caches result to class property.
   * @returns input duration
   */
  private async getInputDuration(): Promise<number> {
    if (this.duration) return this.duration;

    return new Promise((resolve, reject) => {
      ffmpeg(this.source).ffprobe((err, data) => {
        if (err) return reject(err);
        this.duration = data.format.duration;
        resolve(this.duration);
      });
    });
  }

  /**
   *
   * @param relativeProgress progress of the current task (0 to 100)
   * @param currentPass current pass (>=1)
   * @param totalPasses  total passes (>=1)
   * @returns real progress taking into account all passes
   */
  private calculateProgress(
    relativeProgress: number,
    currentPass: number,
    totalPasses: number,
  ): number {
    const maxPerPass = 100 / totalPasses;
    return Math.round(
      relativeProgress * 100 * (1 / totalPasses) +
        maxPerPass * (currentPass - 1),
    );
  }
}
