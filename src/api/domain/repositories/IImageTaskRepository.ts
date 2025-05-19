import type { ImageTask } from '../entities/ImageTask';

export interface IImageTaskRepository {
  create(task: Omit<ImageTask, 'versions'>): Promise<ImageTask>;
  findById(taskId: string): Promise<ImageTask | null>;
  update(taskId: string, data: Partial<ImageTask>): Promise<ImageTask | null>;
}