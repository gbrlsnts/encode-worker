import * as FormData from 'form-data';
import { createReadStream, createWriteStream, ReadStream } from 'fs';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  HttpHeader,
  createDirectoryRecursive,
  directoryExists,
} from '../../common/';
import { parse, join } from 'path';
import { rootDirectory } from '../../config/flysystem';

export class HttpFileDriver {
  private axios: AxiosInstance;

  constructor(public rootFolder: string, headers?: HttpHeader[]) {
    const headersConfig = headers?.reduce(
      (obj, header) => ({ ...obj, [header.key]: header.value }),
      {},
    );

    this.axios = axios.create({
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 10000,
      headers: headersConfig,
    });
  }

  /**
   * Get a file from an url
   * @param url url of the file to retrieve
   * @param headers custom headers to send
   * @returns ReadableStream
   */
  async get(url: string, headers?: HttpHeader[]): Promise<ReadStream> {
    const response = await this.axios.request<any, AxiosResponse<ReadStream>>({
      method: 'get',
      url,
      responseType: 'stream',
      headers,
    });

    return response.data;
  }

  /**
   * Send a file to an url
   * @param url url to upload to
   * @param contents contents to send
   * @param headers custom headers to send
   */
  async put(
    url: string,
    contents: ReadStream,
    headers?: HttpHeader[],
  ): Promise<void> {
    // improve for chunk uploads? or config in query
    const form = new FormData();
    form.append('file', contents);

    return this.axios.request({
      method: 'post',
      url,
      headers: {
        ...form.getHeaders(),
        ...headers,
      },
      data: form,
    });
  }

  /**
   * Save a file
   * @param url url to retrieve the file
   * @param path path to save the file
   * @param headers custom headers to send
   * @returns
   */
  async save(url: string, path: string, headers?: HttpHeader[]): Promise<void> {
    path = join(rootDirectory, path);
    const parsedPath = parse(path);

    if (!(await directoryExists(parsedPath.dir)))
      createDirectoryRecursive(parsedPath.dir);

    return new Promise(async (resolve, reject) => {
      const readStream = await this.get(url, headers);

      readStream.on('end', () => resolve()).on('error', (e) => reject(e));

      const writeStream = createWriteStream(path, {
        encoding: 'binary',
      })
        .on('close', () => resolve())
        .on('error', (e) => reject(e));

      readStream.pipe(writeStream);
    });
  }

  /**
   * Upload a file
   * @param url url to send the file to
   * @param path path of the file to send
   * @param headers custom headers to send
   * @returns
   */
  async upload(
    url: string,
    path: string,
    headers?: HttpHeader[],
  ): Promise<void> {
    path = join(rootDirectory, path);

    return new Promise(async (resolve, reject) => {
      try {
        const stream = createReadStream(path);

        stream.on('error', (e) => reject(e));

        await this.put(url, stream, headers);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
