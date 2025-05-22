export interface IMessage {
  taskId: string;
  originalFilename: string;
  originalPath: string;
  metadata: {
    width: number;
    height: number;
    mimetype: string;
    exif?: Record<string, any>;
  };
}

export interface IMessagingService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publishMessage(queue: string, message: IMessage): Promise<void>;
  consumeMessages(queue: string, callback: (message: IMessage) => Promise<void>): Promise<void>;
}
