// StageFlow - Authentication Service
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  microsoftId?: string;
  tenantName: string;
  tenantSubdomain: string;
}

interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  // Generate JWT Token
  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Verify password
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Register new user with tenant
  async register(userData: CreateUserData) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Check if subdomain is available
      const existingTenant = await prisma.tenant.findUnique({
        where: { subdomain: userData.tenantSubdomain }
      });

      if (existingTenant) {
        throw new Error('Subdomain already taken');
      }

      // Hash password if provided
      let hashedPassword;
      if (userData.password) {
        hashedPassword = await this.hashPassword(userData.password);
      }

      // Create tenant and user in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create tenant
        const tenant = await tx.tenant.create({
          data: {
            name: userData.tenantName,
            subdomain: userData.tenantSubdomain,
            subscriptionTier: 'TRIAL',
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });

        // Create user
        const user = await tx.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            googleId: userData.googleId,
            microsoftId: userData.microsoftId,
            role: 'ADMIN', // First user is admin
            tenantId: tenant.id
          },
          include: {
            tenant: true
          }
        });

        return { user, tenant };
      });

      // Generate token
      const token = this.generateToken(result.user.id);

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          tenant: {
            id: result.tenant.id,
            name: result.tenant.name,
            subdomain: result.tenant.subdomain,
            subscriptionTier: result.tenant.subscriptionTier
          }
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(loginData: LoginData) {
    try {
      // Find user with tenant info
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: { tenant: true }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      if (!user.password) {
        throw new Error('Please login with your OAuth provider');
      }

      const isValidPassword = await this.verifyPassword(loginData.password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenant: {
            id: user.tenant.id,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
            subscriptionTier: user.tenant.subscriptionTier
          }
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
          subscriptionTier: user.tenant.subscriptionTier,
          trialEndsAt: user.tenant.trialEndsAt
        }
      };
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // OAuth user creation/login
  async handleOAuthUser(profile: any, provider: 'google' | 'microsoft') {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const providerId = profile.id;

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
      });

      if (user) {
        // Update OAuth ID if needed
        if (provider === 'google' && !user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: providerId },
            include: { tenant: true }
          });
        } else if (provider === 'microsoft' && !user.microsoftId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { microsoftId: providerId },
            include: { tenant: true }
          });
        }
      } else {
        // Create new user - they'll need to complete tenant setup
        const tenantName = name + "'s Organization";
        const subdomain = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

        const result = await this.register({
          email,
          name,
          tenantName,
          tenantSubdomain: subdomain,
          ...(provider === 'google' ? { googleId: providerId } : { microsoftId: providerId })
        });

        return result;
      }

      // Generate token for existing user
      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenant: {
            id: user.tenant.id,
            name: user.tenant.name,
            subdomain: user.tenant.subdomain,
            subscriptionTier: user.tenant.subscriptionTier
          }
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
    } catch (error) {
      console.error('OAuth user error:', error);
      throw error;
    }
  }
}