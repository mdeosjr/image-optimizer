import mongoose from 'mongoose';
import type { Connection } from 'mongoose';
import type { IDatabaseConnection } from '@/shared/domain/services/IDatabaseConnection';

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

  getConnection(): typeof mongoose {
    return mongoose;
  }
}
