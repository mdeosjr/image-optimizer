import type { IImageTaskRepository } from '@/api/domain/repositories/IImageTaskRepository';
import type { ImageTask } from '@/api/domain/entities/ImageTask';

export class GetTaskStatus {
  constructor(private readonly repo: IImageTaskRepository) {}

  async execute(taskId: string): Promise<ImageTask | null> {
    return await this.repo.findById(taskId);
  }
}