import express, { json, urlencoded } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createApiRouter } from './interface/routes';
import { DatabaseConnection } from '@/shared/infrastructure/db/connection';
import { MessagingService } from '@/shared/infrastructure/messaging/connection';
import logger from '../shared/logger/logger';
import { logMiddleware } from '@/shared/logger/loggerMiddleware';
import { errorMiddleware } from '@/shared/errors/errorMiddleware';

dotenv.config();

const app = express();
const {
  PORT,
  MONGODB_URI,
  RABBITMQ_URI
} = process.env;

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

async function startServer(): Promise<void> {
  if (!MONGODB_URI || !RABBITMQ_URI) {
    throw new Error('Connection environment variables are not defined');
  }

  try {
    const dbInstance = DatabaseConnection.getInstance();
    await dbInstance.connect(MONGODB_URI);
    const db = dbInstance.getConnection();

    const messaging = MessagingService.getInstance();
    await messaging.initialize(RABBITMQ_URI);
    const messagingService = messaging.getService();

    app.use(logMiddleware);
    app.use(createApiRouter(db, messagingService));
    app.use(errorMiddleware);

    app.listen(PORT, () => {
      logger.info(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Error starting API');
    process.exit(1);
  }
}

startServer();
