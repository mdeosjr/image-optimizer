import type { Request, Response } from 'express';
import type { UploadImage } from '@/api/useCases/uploadImage';
import { AppError, STATUS_CODE } from '@/shared/errors/AppError';

export class UploadController {
  constructor(private readonly uploadImage: UploadImage) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const taskId = await this.uploadImage.execute(req);
      
      return res.status(202).json({ taskId });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }

      return res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }
}
