import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import logger from '@/utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        companyId: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing authentication token', 401, 'AUTH_MISSING_TOKEN');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid or expired token', 401, 'AUTH_INVALID_TOKEN'));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token has expired', 401, 'AUTH_TOKEN_EXPIRED'));
    }

    return next(new AppError('Authentication failed', 401, 'AUTH_ERROR'));
  }
};

/**
 * Authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401, 'AUTH_UNAUTHORIZED'));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by user ${req.user.userId} for action requiring roles: ${roles.join(', ')}`);
      return next(new AppError('Insufficient permissions', 403, 'AUTH_FORBIDDEN'));
    }

    next();
  };
};
