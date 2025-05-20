import type { Request, Response } from 'express';
import { AppError, STATUS_CODE } from '../errors/AppError';
import logger from '../logger/logger';

export function errorMiddleware(err: Error, req: Request, res: Response): void {
  if (err instanceof AppError) {
    logger.warn(
      {
        error: err.message,
        statusCode: err.statusCode,
        path: req.originalUrl,
        method: req.method,
        requestId: req.headers['x-request-id'] || 'unknown',
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
      requestId: req.headers['x-request-id'] || 'unknown',
    },
    `Unexpected error: ${err.message}`
  );

  res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
  });
}
