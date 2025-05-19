import type { IImageTaskRepository } from '@/shared/domain/repositories/IImageTaskRepository';
import type { ImageTask } from '@/shared/domain/entities/ImageTask';

export class GetTaskStatus {
  constructor(private readonly repo: IImageTaskRepository) {}

  async execute(taskId: string): Promise<ImageTask | null> {
    return await this.repo.findById(taskId);
  }
}
