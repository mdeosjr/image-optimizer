import type { Request, Response } from 'express';
import type { UploadImage } from '@/api/useCases/uploadImage';

export class UploadController {
  constructor(private readonly uploadImage: UploadImage) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const taskId = await this.uploadImage.execute(req);
      
      return res.status(202).json({ taskId });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}