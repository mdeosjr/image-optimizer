import logger from '@/infrastructure/logger/logger';
import type { NextFunction, Request, Response } from 'express';
import { AppError, STATUS_CODE } from './AppError';

export function errorMiddleware(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(
      {
        error: err.message,
        statusCode: err.statusCode,
        path: req.originalUrl,
        method: req.method,
      },
      `AppError: ${err.message}`
    );

    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      method: req.method,
    },
    `Unexpected error: ${err.message}`
  );

  res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
  });
}
