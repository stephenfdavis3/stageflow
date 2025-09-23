// StageFlow - Authentication Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tenantId: string;
        role: string;
      };
    }
  }
}

// JWT Authentication Middleware
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tenant: true }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Tenant isolation middleware
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.tenantId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Tenant access required'
    });
  }
  next();
};