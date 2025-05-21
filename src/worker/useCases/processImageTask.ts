import type { IMessage } from '@/shared/domain/services/IMessagingService';
import type { IImageTaskRepository } from '@/shared/domain/repositories/IImageTaskRepository';
import type { ImageVersion } from '@/shared/domain/entities/ImageTask';
import { TaskStatus } from '@/shared/domain/entities/ImageTask';
import sharp from 'sharp';
import logger from '@/shared/logger/logger';
import fs from 'node:fs/promises';
import path from 'node:path';

export class ProcessImageTask {
  constructor(private readonly repo: IImageTaskRepository) {}

  async execute(message: IMessage): Promise<void> {
    const originalName = path.parse(message.originalFilename).name;
    const optimizedDir = path.join('/optimized', `${originalName}_optimized`);
    
    try {
      logger.info({ message }, 'Starting image processing');
      await this.repo.update(message.taskId, { status: TaskStatus.PROCESSING });

      const versions = [
        {
          name: 'low',
          width: Number.parseInt(process.env.OPTIMIZE_LOW_WIDTH || '320', 10),
          quality: Number.parseInt(process.env.OPTIMIZE_LOW_QUALITY || '40', 10),
        },
        {
          name: 'medium',
          width: Number.parseInt(process.env.OPTIMIZE_MEDIUM_WIDTH || '640', 10),
          quality: Number.parseInt(process.env.OPTIMIZE_MEDIUM_QUALITY || '70', 10),
        },
        {
          name: 'high',
          width: undefined,
          quality: Number.parseInt(process.env.OPTIMIZE_HIGH_QUALITY || '90', 10),
        },
      ];

      const output: { low: ImageVersion; medium: ImageVersion; high: ImageVersion } = {
        low: undefined as unknown as ImageVersion,
        medium: undefined as unknown as ImageVersion,
        high: undefined as unknown as ImageVersion,
      };

      await fs.mkdir(optimizedDir, { recursive: true });

      for (const v of versions) {
        const outFile = `${originalName}_${v.name}.jpg`;
        const outPath = path.join(optimizedDir, outFile);
        const img = sharp(message.originalPath);
        const { width, height, size } = await img
          .resize({ width: v.width })
          .jpeg({ quality: v.quality })
          .toFile(outPath);

        output[v.name as ImageVersion['quality']] = {
          path: outPath,
          width,
          height,
          size,
          quality: v.name as ImageVersion['quality'],
        };
      }

      await this.repo.update(message.taskId, {
        status: TaskStatus.COMPLETED,
        processedAt: new Date(),
        versions: output,
      });

      logger.info({ taskId: message.taskId }, 'Processing finished');
    } catch (error) {
      logger.error({ err: error }, 'Error processing image');

      await this.repo.update(message.taskId, {
        status: TaskStatus.FAILED,
        errorMessage: (error as Error).message,
      });
    } finally {
      try {
        await fs.rm(message.originalPath, { force: true });
        logger.info({ file: message.originalPath }, 'Temporary file cleaned');
      } catch (err) {
        logger.warn({ err }, 'Failed to clean temporary file');
      }
    }
  }
}
