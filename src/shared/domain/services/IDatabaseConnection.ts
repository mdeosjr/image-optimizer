export interface IDatabaseConnection {
  connect(uri: string): Promise<void>;
  disconnect(): Promise<void>;
  getConnection(): any;
}
