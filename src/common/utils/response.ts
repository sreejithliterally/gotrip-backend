import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse['meta'],
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500) {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
}
