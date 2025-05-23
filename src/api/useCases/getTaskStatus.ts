import type { ImageTask } from '@/domain/entities/ImageTask';
import type { IImageTaskRepository } from '@/domain/repositories/IImageTaskRepository';
import { AppError, STATUS_CODE } from '@/utils/errors/AppError';

export class GetTaskStatus {
  constructor(private readonly repo: IImageTaskRepository) {}

  async execute(taskId: string): Promise<ImageTask | null> {
    const task = await this.repo.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', STATUS_CODE.NOT_FOUND);
    }

    return task;
  }
}
