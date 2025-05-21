import type { Request } from 'express';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import type { IImageTaskRepository } from '@/domain/repositories/IImageTaskRepository';
import type { IMessagingService } from '@/domain/services/IMessagingService';
import type { ImageTask } from '@/domain/entities/ImageTask';
import { TaskStatus } from '@/domain/entities/ImageTask';
import { AppError, STATUS_CODE } from '@/utils/errors/AppError';

export class UploadImage {
  constructor(
    private readonly repo: IImageTaskRepository,
    private readonly queue: IMessagingService
  ) {}

  async execute(req: Request): Promise<{ task_id: string; status: string }> {
    if (!req.file) {
      throw new AppError('No file uploaded', STATUS_CODE.BAD_REQUEST);
    }

    const { filename, path: tempPath, mimetype } = req.file;
    const taskId = uuid();
    const metadata = await sharp(tempPath).metadata();

    if (!metadata.width || !metadata.height) {
      throw new AppError('Invalid image file', STATUS_CODE.UNPROCESSABLE_ENTITY);
    }

    const task: Omit<ImageTask, 'versions'> = {
      taskId,
      originalFilename: filename,
      status: TaskStatus.PENDING,
      originalMetadata: {
        width: metadata.width,
        height: metadata.height,
        mimetype,
        exif: metadata.exif,
      },
    };

    await this.repo.create(task);

    await this.queue.publishMessage('image-processing', {
      taskId,
      originalFilename: filename,
      originalPath: tempPath,
      metadata: task.originalMetadata,
    });

    return { task_id: taskId, status: TaskStatus.PENDING };
  }
}
