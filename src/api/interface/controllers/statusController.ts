import type { GetTaskStatus } from '@/api/useCases/getTaskStatus';
import { STATUS_CODE } from '@/utils/errors/AppError';
import type { NextFunction, Request, Response } from 'express';

export class StatusController {
  constructor(private readonly getStatus: GetTaskStatus) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      const task = await this.getStatus.execute(taskId);

      res.status(STATUS_CODE.OK).json(task);
    } catch (error) {
      next(error);
    }
  }
}
