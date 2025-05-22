import dotenv from 'dotenv';
import logger from '@/infrastructure/logger/logger';
import { DatabaseConnection } from '@/infrastructure/db/connection';
import { MessagingService } from '@/infrastructure/messaging/connection';
import { ImageTaskRepository } from '@/infrastructure/db/ImageTaskRepository';
import { ProcessImageTask } from './useCases/processImageTask';
import { RetryManager } from '@/utils/retry/RetryManager';

dotenv.config();

async function startWorker() {
  if (!process.env.MONGODB_URI || !process.env.RABBITMQ_URI) {
    logger.error('Connection environment variables are not defined');
    process.exit(1);
  }

  try {
    const db = DatabaseConnection.getInstance();
    await db.connect(process.env.MONGODB_URI);
    const repo = new ImageTaskRepository(db.getConnection());

    const messaging = MessagingService.getInstance();
    await messaging.initialize(process.env.RABBITMQ_URI);
    const rabbit = messaging.getService();

    const retryManager = new RetryManager(repo, rabbit, {
      maxAttempts: 3,
      queueName: 'image-processing',
    });

    const processImageTask = new ProcessImageTask(repo, retryManager);

    await rabbit.consumeMessages('image-processing', async (msg) => {
      await processImageTask.execute(msg);
    });

    logger.info('Worker ready and consuming image-processing queue');
  } catch (error) {
    logger.error({ err: error }, 'Error starting worker');
    process.exit(1);
  }
}

startWorker();
