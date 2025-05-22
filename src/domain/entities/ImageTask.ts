export enum TaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ImageVersion {
  path: string;
  width: number;
  height: number;
  size: number;
  quality: 'low' | 'medium' | 'high';
}

export interface ImageMetadata {
  width: number;
  height: number;
  mimetype: string;
  exif?: Record<string, any>;
}

export interface ImageTask {
  taskId: string;
  originalFilename: string;
  status: TaskStatus;
  originalMetadata: ImageMetadata;
  processedAt?: Date;
  errorMessage?: string;
  retryCount?: number;
  versions?: {
    low: ImageVersion;
    medium: ImageVersion;
    high: ImageVersion;
  };
}
