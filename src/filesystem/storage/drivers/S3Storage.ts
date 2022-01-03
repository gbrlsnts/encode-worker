import { S3 } from 'aws-sdk';
import { PassThrough } from 'stream';
import { StorageDriver } from '../StorageDriver';
import { S3StorageConfig } from '../../types/';

/**
 * Local storage driver. All URIs should start with s3://
 */
export class S3Storage extends StorageDriver {
  private $driver: S3;
  private $bucket: string;

  constructor(config: S3StorageConfig) {
    super('s3');

    this.$driver = new S3({
      accessKeyId: config.key,
      secretAccessKey: config.secret,
      ...config,
    });

    this.$bucket = config.bucket;
  }

  /**
   * Get the underlying driver
   */
  driver(): S3 {
    return this.$driver;
  }

  /**
   * Clean-up the underlying driver - not used in S3Storage
   */
  async destroy(): Promise<void> {
    return;
  }

  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  async getReadStream(uri: string): Promise<NodeJS.ReadableStream> {
    this.validateUri(uri);

    const params = { Key: uri, Bucket: this.$bucket };

    return this.$driver.getObject(params).createReadStream();
  }

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  async getWriteStream(uri: string): Promise<NodeJS.WritableStream> {
    this.validateUri(uri);

    const stream = new PassThrough();

    const params: S3.PutObjectRequest = {
      Key: uri,
      Body: stream,
      Bucket: this.$bucket,
    };

    await this.$driver.upload(params).promise();

    return stream;
  }

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  async delete(uri: string): Promise<void> {
    this.validateUri(uri);

    const params = { Key: uri, Bucket: this.$bucket };

    await this.$driver.deleteObject(params).promise();
  }
}
