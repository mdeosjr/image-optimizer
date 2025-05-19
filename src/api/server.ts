import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './interface/routes';
import { DatabaseConnection } from './infrastructure/db/connection';
import { MessagingService } from './infrastructure/messaging/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

async function startServer() {
  try {
    const db = DatabaseConnection.getInstance();
    await db.connect(process.env.MONGODB_URI!);

    const messaging = MessagingService.getInstance();
    await messaging.initialize(process.env.RABBITMQ_URI!);

    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
