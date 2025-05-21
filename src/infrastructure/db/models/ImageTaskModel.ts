import { Schema, model } from 'mongoose';
import type { ImageTask } from '@/domain/entities/ImageTask';
import { TaskStatus } from '@/domain/entities/ImageTask';

const ImageVersionSchema = new Schema({
  path: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  size: { type: Number, required: true },
  quality: { type: String, enum: ['low', 'medium', 'high'], required: true },
});

const ImageMetadataSchema = new Schema({
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  mimetype: { type: String, required: true },
  exif: { type: Schema.Types.Mixed },
});

const ImageTaskSchema = new Schema<ImageTask>(
  {
    taskId: { type: String, required: true, unique: true },
    originalFilename: { type: String, required: true },
    status: { type: String, enum: Object.values(TaskStatus), required: true },
    originalMetadata: { type: ImageMetadataSchema, required: true },
    processedAt: { type: Date },
    errorMessage: { type: String },
    versions: {
      low: { type: ImageVersionSchema },
      medium: { type: ImageVersionSchema },
      high: { type: ImageVersionSchema },
    },
  },
  {
    timestamps: true,
  }
);

export const ImageTaskModel = model<ImageTask>('ImageTask', ImageTaskSchema);
export { ImageTaskSchema };
