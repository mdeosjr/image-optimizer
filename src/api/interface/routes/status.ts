import { StatusController } from '@/api/interface/controllers/statusController';
import { GetTaskStatus } from '@/api/useCases/getTaskStatus';
import { ImageTaskRepository } from '@/infrastructure/db/ImageTaskRepository';
import { Router } from 'express';
import type { Connection } from 'mongoose';

export function createStatusRouter(db: Connection) {
  const router = Router();
  const repo = new ImageTaskRepository(db);
  const getTaskStatus = new GetTaskStatus(repo);
  const statusController = new StatusController(getTaskStatus);

  router.get('/status/:taskId', (req, res, next) => statusController.handle(req, res, next));

  return router;
}
