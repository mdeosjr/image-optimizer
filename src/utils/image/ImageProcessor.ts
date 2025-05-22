import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { ImageVersion } from '@/domain/entities/ImageTask';
import logger from '@/infrastructure/logger/logger';
import * as sharp from 'sharp';

interface ProcessingOptions {
  name: string;
  width?: number;
  quality: number;
}

export interface ProcessedImage {
  low: ImageVersion;
  medium: ImageVersion;
  high: ImageVersion;
}

function getDefaultVersions(): ProcessingOptions[] {
  return [
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
}

export async function processImage(
  imagePath: string,
  originalFilename: string
): Promise<ProcessedImage> {
  const originalName = path.parse(originalFilename).name;
  const optimizedDir = path.join('/optimized', `${originalName}_optimized`);

  await fs.mkdir(optimizedDir, { recursive: true });

  const versions = getDefaultVersions();
  const output: ProcessedImage = {
    low: undefined as unknown as ImageVersion,
    medium: undefined as unknown as ImageVersion,
    high: undefined as unknown as ImageVersion,
  };

  for (const v of versions) {
    const outFile = `${originalName}_${v.name}.jpg`;
    const outPath = path.join(optimizedDir, outFile);
    const img = sharp.default(imagePath);
    const { width, height, size } = await img
      .resize({ width: v.width })
      .jpeg({ quality: v.quality })
      .toFile(outPath);

    output[v.name as keyof ProcessedImage] = {
      path: outPath,
      width,
      height,
      size,
      quality: v.name as ImageVersion['quality'],
    };
  }

  return output;
}

export async function cleanTemporaryFile(filePath: string): Promise<void> {
  try {
    await fs.rm(filePath, { force: true });
    logger.info({ file: filePath }, 'Temporary file cleaned');
  } catch (err) {
    logger.warn({ err }, 'Failed to clean temporary file');
  }
}
