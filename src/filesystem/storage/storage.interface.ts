export interface StorageInterface {
  /**
   * Get a readable stream for a URI
   * @param uri uri to get read stream from
   */
  getReadStream(uri: string): Promise<NodeJS.ReadableStream>;

  /**
   * Get a writable stream for a URI
   * @param uri uri where the stream writes to
   */
  getWriteStream(uri: string): Promise<NodeJS.WritableStream>;

  /**
   * Delete a resource at a given uri
   * @param uri uri to delete
   */
  delete(uri: string): Promise<void>;
}
