import mongoose from 'mongoose';
import { MongoDBConnection } from './MongoDBConnection';
import type { IDatabaseConnection } from '@/api/domain/services/IDatabaseConnection';

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
    await this.database.getConnection();
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }

  getConnection() {
    return this.database.getConnection();
  }
}
