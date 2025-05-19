import type { IMessage } from '@/shared/domain/services/IMessagingService';
import type { IImageTaskRepository } from '@/shared/domain/repositories/IImageTaskRepository';
import type { ImageVersion } from '@/shared/domain/entities/ImageTask';
import { TaskStatus } from '@/shared/domain/entities/ImageTask';
import sharp from 'sharp';
import logger from '@/shared/logger';
import fs from 'node:fs/promises';
import path from 'node:path';

export class ProcessImageTask {
  constructor(private readonly repo: IImageTaskRepository) {}

  async execute(message: IMessage): Promise<void> {
    const originalName = path.parse(message.originalFilename).name;
    const optimizedDir = path.join(process.env.UPLOAD_DIR || '/tmp/uploads', `${originalName}_optimized`);
    try {
      logger.info({ message }, 'Starting image processing');
      await this.repo.update(message.taskId, { status: TaskStatus.PROCESSING });

      const versions = [
        { name: 'low', width: 320, quality: 60 },
        { name: 'medium', width: 640, quality: 80 },
        { name: 'high', width: 1280, quality: 95 },
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

        if (v.name === 'low' || v.name === 'medium' || v.name === 'high') {
          output[v.name] = {
            path: outPath,
            width,
            height,
            size,
            quality: v.name,
          };
        }
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
        const tmpDir = path.dirname(message.originalPath);
        await fs.rm(tmpDir, { recursive: true, force: true });
        logger.info({ tmpDir }, 'Temporary folder cleaned');
      } catch (err) {
        logger.warn({ err }, 'Failed to clean temporary folder');
      }
    }
  }
}
