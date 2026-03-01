import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { sendError } from '../utils/response';
import { config } from '../config';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode);
  }

  console.error('❌ Unhandled error:', err);

  const message = config.env === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, 500);
}
