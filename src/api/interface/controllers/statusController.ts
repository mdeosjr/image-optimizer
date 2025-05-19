import { Request, Response } from 'express';
import { GetTaskStatus } from '@/api/useCases/getTaskStatus';

export class StatusController {
  constructor(private readonly getStatus: GetTaskStatus) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId } = req.params;
      const task = await this.getStatus.execute(taskId);

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.json(task);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}