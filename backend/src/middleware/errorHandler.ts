import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import logger from '@/utils/logger';
import { ApiResponse } from '@/types/index';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred', {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: Record<string, string[]> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.errors.reduce(
      (acc, error) => {
        const path = error.path.join('.');
        if (!acc[path]) acc[path] = [];
        acc[path].push(error.message);
        return acc;
      },
      {} as Record<string, string[]>
    );
  } else if (err instanceof Error) {
    message = err.message;
  }

  const response: ApiResponse = {
    success: false,
    status: statusCode,
    message,
    errors: details,
  };

  res.status(statusCode).json(response);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
