import type { ImageTask } from '@/domain/entities/ImageTask';
import type { IImageTaskRepository } from '@/domain/repositories/IImageTaskRepository';
import { ImageTaskSchema } from '@/infrastructure/db/models/ImageTaskModel';
import type { Connection, Model } from 'mongoose';

export class ImageTaskRepository implements IImageTaskRepository {
  private model: Model<ImageTask>;

  constructor(connection: Connection) {
    this.model = connection.model('ImageTask', ImageTaskSchema);
  }

  async create(task: Omit<ImageTask, 'versions'>): Promise<ImageTask> {
    const newTask = await this.model.create(task);
    return newTask.toObject();
  }

  async findById(taskId: string): Promise<ImageTask | null> {
    const task = await this.model.findOne({ taskId });
    return task ? task.toObject() : null;
  }

  async update(taskId: string, data: Partial<ImageTask>): Promise<ImageTask | null> {
    const task = await this.model.findOneAndUpdate({ taskId }, { $set: data }, { new: true });
    return task ? task.toObject() : null;
  }
}
