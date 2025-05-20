import type { IImageTaskRepository } from '@/shared/domain/repositories/IImageTaskRepository';
import type { ImageTask } from '@/shared/domain/entities/ImageTask';
import { AppError, STATUS_CODE } from '@/shared/errors/AppError';

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
