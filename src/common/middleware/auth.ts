import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/api-error';

/**
 * Middleware: Require a valid JWT access token
 */
export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or invalid authorization header');
    }

    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/**
 * Middleware factory: Require specific roles
 */
export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
}
