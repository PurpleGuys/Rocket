import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;

export class AuthService {
  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  // Compare password with hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): { userId: number } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Generate secure random token
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate verification token
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Check if account is locked
  static async isAccountLocked(user: User): Promise<boolean> {
    if (!user.lockUntil) return false;
    return new Date() < user.lockUntil;
  }

  // Lock account after failed attempts
  static async lockAccount(userId: number): Promise<void> {
    const lockDuration = 30 * 60 * 1000; // 30 minutes
    const lockUntil = new Date(Date.now() + lockDuration);
    await storage.updateUserSecurity(userId, {
      loginAttempts: 0,
      lockUntil,
    });
  }

  // Increment login attempts
  static async incrementLoginAttempts(userId: number): Promise<number> {
    const user = await storage.getUser(userId);
    if (!user) return 0;

    const attempts = (user.loginAttempts || 0) + 1;
    await storage.updateUserSecurity(userId, { loginAttempts: attempts });

    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      await this.lockAccount(userId);
    }

    return attempts;
  }

  // Reset login attempts on successful login
  static async resetLoginAttempts(userId: number): Promise<void> {
    await storage.updateUserSecurity(userId, {
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
    });
  }

  // Create session
  static async createSession(userId: number, userAgent?: string, ipAddress?: string): Promise<string> {
    const token = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await storage.createSession({
      userId,
      token,
      expiresAt,
      userAgent,
      ipAddress,
    });

    return token;
  }

  // Validate session
  static async validateSession(token: string): Promise<User | null> {
    try {
      const session = await storage.getSessionByToken(token);
      if (!session || session.expiresAt < new Date()) {
        if (session) {
          await storage.deleteSession(session.id);
        }
        return null;
      }

      const user = await storage.getUser(session.userId);
      if (!user || !user.isActive) {
        return null;
      }

      return user || null;
    } catch (error) {
      console.error('Database error in validateSession:', error);
      return null;
    }
  }

  // Delete session (logout)
  static async deleteSession(token: string): Promise<void> {
    await storage.deleteSessionByToken(token);
  }

  // Cleanup expired sessions
  static async cleanupExpiredSessions(): Promise<void> {
    await storage.deleteExpiredSessions();
  }
}

// Middleware to authenticate requests
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const sessionToken = req.headers['x-session-token'] as string;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  let user: User | null = null;

  try {
    // Try JWT first, then session token
    if (token) {
      const decoded = AuthService.verifyToken(token);
      if (decoded) {
        const foundUser = await storage.getUser(decoded.userId);
        user = foundUser || null;
      }
    } else if (sessionToken) {
      user = await AuthService.validateSession(sessionToken);
    }

    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Auth failed - Token: ${token ? token.substring(0, 20) + '...' : 'missing'}, SessionToken: ${sessionToken ? 'present' : 'missing'}`);
        console.log('AuthHeader:', authHeader);
      }
      return res.status(401).json({ message: 'Accès non autorisé' });
    }

    // Check if account is locked
    const isLocked = await AuthService.isAccountLocked(user);
    if (isLocked) {
      return res.status(423).json({ message: 'Compte temporairement verrouillé' });
    }

    // Check if account is verified (except for verification endpoints)
    if (!user.isVerified && !req.path.includes('/verify')) {
      return res.status(403).json({ 
        message: 'Compte non vérifié. Vérifiez votre email.',
        requiresVerification: true 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Database connection error in auth middleware:', error);
    // If database is unavailable, allow access for development but log the error
    if (process.env.NODE_ENV === 'development') {
      console.log('Database unavailable - allowing development access');
      // Set a default user for development when database is unavailable
      req.user = {
        id: 1,
        email: 'dev@example.com',
        firstName: 'Development',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        phone: '+33123456789',
        password: '',
        verificationToken: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        address: null,
        siret: null,
        isActive: true,
        failedLoginAttempts: 0,
        lastLoginAttempt: null,
        accountLockedUntil: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerificationExpires: null,
        lastPasswordChange: null,
        notifyOnInactivity: true,
        lastInactivityNotification: null
      } as any;
      next();
    } else {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }
  }
};

// Middleware to check admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  next();
};

// Middleware to check if user owns resource or is admin
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user?.role === 'admin' || req.user?.id === parseInt(resourceUserId)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Accès non autorisé à cette ressource' });
  };
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}