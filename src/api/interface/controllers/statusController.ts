import type { Request, Response } from 'express';
import type { GetTaskStatus } from '@/api/useCases/getTaskStatus';
import { AppError, STATUS_CODE } from '@/shared/errors/AppError';

export class StatusController {
  constructor(private readonly getStatus: GetTaskStatus) {}

  async handle(req: Request, res: Response): Promise<Response> {
    const { taskId } = req.params;
    const task = await this.getStatus.execute(taskId);

    if (!task) {
      throw new AppError('Task not found', STATUS_CODE.NOT_FOUND);
    }

    return res.status(STATUS_CODE.OK).json(task);
  }
}
