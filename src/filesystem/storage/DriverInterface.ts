export interface DriverInterface {
  /**
   * Get the underlying driver
   */
  driver(): any;

  /**
   * Clean-up the underlying driver
   */
  destroy(): Promise<void>;

  /**
   * Get the supported protocols
   * @returns true if protocol is handled by this storage
   */
  protocols(): string[];

  /**
   * Check if this storage handles a protocol
   * @param protocol protocol to check
   * @returns true if protocol is handled by this storage
   */
  handles(protocol: string): boolean;
}
