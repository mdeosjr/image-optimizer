import type { Request, Response } from 'express';
import type { GetTaskStatus } from '@/api/useCases/getTaskStatus';
import logger from '@/shared/logger';

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
      logger.error({ err: error }, 'Erro ao buscar status da task');
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
