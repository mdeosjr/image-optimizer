import amqp, { Channel, ChannelModel } from 'amqplib';
import { IMessagingService, IMessage } from '@/api/domain/services/IMessagingService';

export class RabbitMQService implements IMessagingService {
  private connection!: ChannelModel;
  private channel!: Channel;

  constructor(private readonly uri: string) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.uri);

      this.channel = await this.connection.createChannel();
    } catch (error) {
      throw new Error(`Failed to connect to RabbitMQ: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      throw new Error(`Failed to disconnect from RabbitMQ: ${(error as Error).message}`);
    }
  }

  async publishMessage(queue: string, message: IMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      throw new Error(`Failed to publish message: ${(error as Error).message}`);
    }
  }

  async consumeMessages(queue: string, callback: (message: IMessage) => Promise<void>): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString()) as IMessage;
            await callback(content);
            this.channel?.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            this.channel?.nack(msg, false, true);
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to consume messages: ${(error as Error).message}`);
    }
  }
}
