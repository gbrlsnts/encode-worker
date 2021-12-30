import { createReadStream, createWriteStream, ReadStream } from 'fs';
import { stat } from 'fs/promises';
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
    const response = await axios.request<any, AxiosResponse<ReadStream>>({
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
   * @param size content size
   * @param headers custom headers to send
   */
  async put(
    url: string,
    contents: ReadStream,
    size: number,
    headers?: HttpHeader[],
  ): Promise<void> {
    return axios.request({
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': size,
        ...headers,
      },
      data: contents,
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

    return new Promise((resolve, reject) => {
      stat(path)
        .then((stats) => stats.size)
        .then((size) => {
          const stream = createReadStream(path);

          stream.on('end', () => resolve());
          stream.on('error', (e) => reject(e));

          return {
            size,
            stream,
          };
        })
        .then((data) => this.put(url, data.stream, data.size, headers))
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  }
}
