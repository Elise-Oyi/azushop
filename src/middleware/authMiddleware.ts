import type { Request, Response, NextFunction } from "express";
import admin from "../config/admin.ts";
import { userService } from "../services/userService.ts";
import type { User } from "../models/user.model.ts";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User & { uid: string };
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.error('Authorization header is required', 401);
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.error('Token is required', 401);
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from Firestore
    const user = await userService.findByUserId(decodedToken.uid);
    
    if (!user) {
      return res.error('User not found', 404);
    }

    // Attach user to request
    req.user = { ...user, uid: decodedToken.uid };
    next();
    
  } catch (error: any) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.error('Token expired', 401);
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.error('Token revoked', 401);
    }
    
    return res.error('Invalid token', 401);
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.error('Authentication required', 401);
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.error('Insufficient permissions', 403);
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');

export const requireAuth = verifyToken;