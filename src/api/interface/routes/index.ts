import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import type { IMessagingService } from '@/shared/domain/services/IMessagingService';
import type { Connection } from 'mongoose';
import { createStatusRouter } from './status';
import { createUploadRouter } from './upload';

export function createApiRouter(db: Connection, messaging: IMessagingService): ExpressRouter {
  const router = Router();
  router.use('/api', createStatusRouter(db));
  router.use('/api', createUploadRouter(db, messaging));
  router.get('/health', (_, res) => {
    res.status(200).send('OK');
  });
  return router;
}
