import type { IDatabaseConnection } from '@/domain/services/IDatabaseConnection';
import mongoose from 'mongoose';
import type { Connection } from 'mongoose';

export class MongoDBConnection implements IDatabaseConnection {
  private connection!: Connection;

  constructor(private readonly uri: string) {}

  async connect(): Promise<void> {
    await mongoose.connect(this.uri);
    this.connection = mongoose.connection;
  }

  async disconnect(): Promise<void> {
    await this.connection.close();
  }

  getConnection(): Connection {
    return this.connection;
  }
}
