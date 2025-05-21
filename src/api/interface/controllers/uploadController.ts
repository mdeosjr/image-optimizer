import type { NextFunction, Request, Response } from 'express';
import type { UploadImage } from '@/api/useCases/uploadImage';
import { AppError, STATUS_CODE } from '@/shared/errors/AppError';

export class UploadController {
  constructor(private readonly uploadImage: UploadImage) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskStatus = await this.uploadImage.execute(req);
      
      res.status(STATUS_CODE.ACCEPTED).json(taskStatus);
    } catch (error) {
      next(error)
    }
  }
}
