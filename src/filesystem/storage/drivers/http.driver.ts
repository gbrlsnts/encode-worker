import { ReadStream } from 'fs';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { HttpHeader, HttpStorageConfig } from '../../../common';
import { StorageDriver } from '../storage.driver.abstract';

export class HttpStorage extends StorageDriver {
  private $driver: AxiosInstance;

  constructor(config?: HttpStorageConfig) {
    super(['http', 'https']);

    const headersConfig = config?.headers?.reduce(
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
}
