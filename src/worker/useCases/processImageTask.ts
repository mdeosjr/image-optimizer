import { TaskStatus } from '@/domain/entities/ImageTask';
import type { IImageTaskRepository } from '@/domain/repositories/IImageTaskRepository';
import type { IMessage } from '@/domain/services/IMessagingService';
import logger from '@/infrastructure/logger/logger';
import { cleanTemporaryFile, processImage } from '@/utils/image/ImageProcessor';
import { RetryManager } from '@/utils/retry/RetryManager';

const MAX_RETRY_ATTEMPTS = 3;

export class ProcessImageTask {
  constructor(
    private readonly repo: IImageTaskRepository,
    private readonly retryManager: RetryManager
  ) {}

  async execute(message: IMessage): Promise<void> {
    try {
      const task = await this.repo.findById(message.taskId);
      const retryCount = task?.retryCount || 0;

      logger.info(
        { message, attempt: retryCount + 1 },
        `Starting image processing (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`
      );

      await this.repo.update(message.taskId, {
        status: TaskStatus.PROCESSING,
        retryCount: retryCount,
      });

      const processedVersions = await processImage(message.originalPath, message.originalFilename);

      await this.repo.update(message.taskId, {
        status: TaskStatus.COMPLETED,
        processedAt: new Date(),
        versions: processedVersions,
      });

      logger.info({ taskId: message.taskId }, 'Processing finished successfully');
    } catch (error) {
      logger.error({ err: error }, 'Error processing image');

      await this.retryManager.handleRetry(message.taskId, error as Error, message);
    } finally {
      try {
        const task = await this.repo.findById(message.taskId);

        if (task && RetryManager.hasCompletedAllAttempts(task, MAX_RETRY_ATTEMPTS)) {
          await cleanTemporaryFile(message.originalPath);
        }
      } catch (err) {
        logger.warn({ err }, 'Error in cleanup phase');
      }
    }
  }
}
