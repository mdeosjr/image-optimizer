import { Router } from 'express';
import { StatusController } from '@/api/interface/controllers/statusController';
import { GetTaskStatus } from '@/api/useCases/getTaskStatus';
import { ImageTaskRepository } from '@/shared/infrastructure/db/ImageTaskRepository';
import type { Connection } from 'mongoose';

export function createStatusRouter(db: Connection) {
  const router = Router();
  const repo = new ImageTaskRepository(db);
  const getTaskStatus = new GetTaskStatus(repo);
  const statusController = new StatusController(getTaskStatus);

  router.get('/status/:taskId', (req, res) => statusController.handle(req, res));

  return router;
}
