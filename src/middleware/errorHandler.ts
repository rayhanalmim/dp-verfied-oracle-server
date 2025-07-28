import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/loggerService';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error details
  logger.error(`Error [${statusCode}]: ${message}`, err);
  
  // Send error response to client
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
