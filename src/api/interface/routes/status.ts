import { Router } from 'express';
import { StatusController } from '@/api/interface/controllers/statusController';
import { GetTaskStatus } from '@/api/useCases/getTaskStatus';
import { ImageTaskRepository } from '@/api/infrastructure/db/ImageTaskRepository';
import { DatabaseConnection } from '@/api/infrastructure/db/connection';

const router = Router();

const db = DatabaseConnection.getInstance().getConnection();
const repo = new ImageTaskRepository(db);
const getTaskStatus = new GetTaskStatus(repo);
const statusController = new StatusController(getTaskStatus);

router.get('/status/:taskId', (req, res) => statusController.handle(req, res));

export default router;
