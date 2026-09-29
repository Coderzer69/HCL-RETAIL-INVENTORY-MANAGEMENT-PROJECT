import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { roles: { include: { role: true } } },
    });

    if (!user) {
      throw new ApiError(401, 'Unauthorized: Invalid token');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Forbidden: User account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Unauthorized: Invalid token'));
    } else {
      next(error);
    }
  }
};

export const authorize = (requiredRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized');
      }

      const userRoles = req.user.roles.map((r: any) => r.role.name);
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRole && !userRoles.includes('ADMIN')) {
        throw new ApiError(403, 'Forbidden: Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
