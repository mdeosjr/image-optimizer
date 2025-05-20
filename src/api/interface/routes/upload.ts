import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '@/api/interface/controllers/uploadController';
import { UploadImage } from '@/api/useCases/uploadImage';
import { ImageTaskRepository } from '@/shared/infrastructure/db/ImageTaskRepository';
import type { Connection } from 'mongoose';
import type { IMessagingService } from '@/shared/domain/services/IMessagingService';

export function createUploadRouter(db: Connection, messaging: IMessagingService) {
  const router = Router();
  const upload = multer({ dest: process.env.UPLOAD_DIR });
  const repo = new ImageTaskRepository(db);
  const uploadImage = new UploadImage(repo, messaging);
  const uploadController = new UploadController(uploadImage);

  router.post('/upload', upload.single('image'), (req, res, next) => uploadController.handle(req, res, next));

  return router;
}
