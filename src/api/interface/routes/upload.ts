import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '@/api/interface/controllers/uploadController';
import { UploadImage } from '@/api/useCases/uploadImage';
import { ImageTaskRepository } from '@/shared/infrastructure/db/ImageTaskRepository';
import { DatabaseConnection } from '@/shared/infrastructure/db/connection';
import { MessagingService } from '@/shared/infrastructure/messaging/connection';

const router = Router();
const upload = multer({ dest: process.env.UPLOAD_DIR });

const db = DatabaseConnection.getInstance().getConnection();
const repo = new ImageTaskRepository(db);
const messaging = MessagingService.getInstance().getService();
const uploadImage = new UploadImage(repo, messaging);
const uploadController = new UploadController(uploadImage);

router.post('/upload', upload.single('image'), (req, res) => uploadController.handle(req, res));

export default router;
