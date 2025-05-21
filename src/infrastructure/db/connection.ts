import { MongoDBConnection } from './MongoDBConnection';
import type { IDatabaseConnection } from '@/domain/services/IDatabaseConnection';
import logger from '@/infrastructure/logger/logger';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private database!: IDatabaseConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      return;
    }
    this.database = new MongoDBConnection(uri);
    await this.database.connect(uri);
    this.isConnected = true;
    logger.info('Connected to MongoDB');
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }
    try {
      await this.database.disconnect();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error({ err: error }, 'MongoDB disconnection error');
      throw error;
    }
  }

  getConnection() {
    return this.database.getConnection();
  }
}
