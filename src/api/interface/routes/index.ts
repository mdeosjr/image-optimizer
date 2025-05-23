import type { IMessagingService } from '@/domain/services/IMessagingService';
import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import type { Connection } from 'mongoose';
import { createStatusRouter } from './status';
import { createUploadRouter } from './upload';

export function createApiRouter(db: Connection, messaging: IMessagingService): ExpressRouter {
  const router = Router();

  router.use('/api', createStatusRouter(db));
  router.use('/api', createUploadRouter(db, messaging));
  router.get('/api/health', (_, res, next) => {
    try {
      res.status(200).send('OK');
    } catch (err) {
      next(err);
    }
  });

  return router;
}
