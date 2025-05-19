import { IImageTaskRepository } from '@/api/domain/repositories/IImageTaskRepository';
import { ImageTask } from '@/api/domain/entities/ImageTask';

export class GetTaskStatus {
  constructor(private readonly repo: IImageTaskRepository) {}

  async execute(taskId: string): Promise<ImageTask | null> {
    return await this.repo.findById(taskId);
  }
}