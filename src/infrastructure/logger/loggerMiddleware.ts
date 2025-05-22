import type { NextFunction, Request, Response } from 'express';
import logger from './logger';

export function logMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const { statusCode } = res;

    logger.info(
      {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime}ms`,
        ip,
        userAgent: headers['user-agent'],
      },
      `${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`
    );
  });

  next();
}
