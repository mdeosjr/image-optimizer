import { RabbitMQService } from './RabbitMQMessaging';
import type { IMessagingService } from '@/domain/services/IMessagingService';

export class MessagingService {
  private static instance: MessagingService;
  private service: IMessagingService | null = null;

  private constructor() {}

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  async initialize(uri: string): Promise<void> {
    if (this.service) {
      return;
    }

    this.service = new RabbitMQService(uri);
    await this.service.connect();
  }

  getService(): IMessagingService {
    if (!this.service) {
      throw new Error('Messaging service not initialized');
    }
    return this.service;
  }

  async disconnect(): Promise<void> {
    if (this.service) {
      await this.service.disconnect();
      this.service = null;
    }
  }
}
