import * as FormData from 'form-data';
import { ReadStream } from 'fs';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PassThrough } from 'stream';
import { HttpHeader } from '../../../common/';
import { StorageDriver } from '../StorageDriver';

export class HttpStorage extends StorageDriver {
  private $driver: AxiosInstance;

  constructor(public rootFolder: string, headers?: HttpHeader[]) {
    super(['http', 'https']);

    const headersConfig = headers?.reduce(
      (obj, header) => ({ ...obj, [header.key]: header.value }),
      {},
    );

    this.$driver = axios.create({
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 10000,
      headers: headersConfig,
    });
  }

  /**
   * Get the underlying driver.
   */
  driver(): AxiosInstance {
    return this.$driver;
  }

  /**
   * Clean-up the underlying driver - not used in HttpStorage
   */
  async destroy(): Promise<void> {
    return;
  }

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   * @param headers custom headers to send
   */
  async getReadStream(
    uri: string,
    headers?: HttpHeader[],
  ): Promise<NodeJS.ReadableStream> {
    const response = await this.$driver.request<any, AxiosResponse<ReadStream>>(
      {
        method: 'get',
        url: uri,
        responseType: 'stream',
        headers,
      },
    );

    return response.data;
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   * @param headers custom headers to send
   */
  async getWriteStream(
    uri: string,
    headers?: HttpHeader[],
  ): Promise<NodeJS.WritableStream> {
    const stream = new PassThrough();

    // improve for chunk uploads? or config in query
    const form = new FormData();
    form.append('file', stream);

    await this.$driver.request({
      method: 'post',
      url: uri,
      headers: {
        ...form.getHeaders(),
        ...headers,
      },
      data: form,
    });

    return stream;
  }
}
