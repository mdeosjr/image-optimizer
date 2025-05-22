import { TaskStatus } from '@/domain/entities/ImageTask';
import type { IImageTaskRepository } from '@/domain/repositories/IImageTaskRepository';
import type { IMessage, IMessagingService } from '@/domain/services/IMessagingService';
import logger from '@/infrastructure/logger/logger';

export interface RetryOptions {
  maxAttempts: number;
  queueName: string;
}

export class RetryManager {
  constructor(
    private readonly repo: IImageTaskRepository,
    private readonly messaging: IMessagingService,
    private readonly options: RetryOptions = { maxAttempts: 3, queueName: 'image-processing' }
  ) {}

  public async handleRetry(taskId: string, error: Error, message: IMessage): Promise<void> {
    const task = await this.repo.findById(taskId);
    const retryCount = (task?.retryCount || 0) + 1;

    if (retryCount <= this.options.maxAttempts && this.messaging) {
      logger.info({ taskId, attempt: retryCount }, 'Scheduling retry');

      await this.repo.update(taskId, {
        status: TaskStatus.FAILED,
        errorMessage: `Attempt ${retryCount}/${this.options.maxAttempts} failed: ${error.message}.`,
        retryCount,
      });

      const delayMs = 1000 * 2 ** (retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      await this.messaging.publishMessage(this.options.queueName, message);
    } else {
      logger.error({ taskId }, `Task failed after ${retryCount} attempts`);

      await this.repo.update(taskId, {
        status: TaskStatus.FAILED,
        errorMessage: `Failed after ${
          retryCount > this.options.maxAttempts ? this.options.maxAttempts : retryCount
        } attempts. Last error: ${error.message}`,
        retryCount,
      });
    }
  }

  public static hasCompletedAllAttempts(
    task: { status: TaskStatus; retryCount?: number },
    maxAttempts: number
  ): boolean {
    return (
      task?.status === TaskStatus.COMPLETED ||
      (task?.status === TaskStatus.FAILED && (task?.retryCount || 0) >= maxAttempts)
    );
  }
}
