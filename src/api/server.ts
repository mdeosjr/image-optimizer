import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createApiRouter } from './interface/routes';
import { DatabaseConnection } from '@/shared/infrastructure/db/connection';
import { MessagingService } from '@/shared/infrastructure/messaging/connection';
import logger from '../shared/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.RABBITMQ_URI) {
    throw new Error('Connection environment variables are not defined');
  }

  try {
    const dbInstance = DatabaseConnection.getInstance();
    await dbInstance.connect(process.env.MONGODB_URI);
    const db = dbInstance.getConnection();

    const messaging = MessagingService.getInstance();
    await messaging.initialize(process.env.RABBITMQ_URI);
    const messagingService = messaging.getService();

    app.use(createApiRouter(db, messagingService));

    app.listen(PORT, () => {
      logger.info(`API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Error starting API');
    process.exit(1);
  }
}

startServer();
