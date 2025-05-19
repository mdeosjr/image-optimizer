import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './interface/routes';
import { DatabaseConnection } from '@/shared/infrastructure/db/connection';
import { MessagingService } from '@/shared/infrastructure/messaging/connection';
import logger from '../shared/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.RABBITMQ_URI) {
    throw new Error('Connection environment variables are not defined');
  }

  try {
    const db = DatabaseConnection.getInstance();
    await db.connect(process.env.MONGODB_URI);

    const messaging = MessagingService.getInstance();
    await messaging.initialize(process.env.RABBITMQ_URI);

    app.listen(PORT, () => {
      logger.info(`API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error({ err: error }, 'Erro ao iniciar o servidor');
    process.exit(1);
  }
}

startServer();
