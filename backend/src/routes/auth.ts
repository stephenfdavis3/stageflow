// StageFlow - Authentication Routes
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const authService = new AuthService();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  tenantName: z.string().min(2, 'Organization name must be at least 2 characters'),
  tenantSubdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(20, 'Subdomain must be less than 20 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await authService.register(validatedData);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result
    });
  } catch (error: any) {
    console.error('Registration route error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    // Handle business logic errors
    res.status(400).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await authService.login(validatedData);

    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error: any) {
    console.error('Login route error:', error);

    // Handle validation errors
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    // Handle business logic errors
    res.status(401).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);

    res.json({
      success: true,
      data: { user }
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(404).json({
      success: false,
      error: 'User not found',
      message: error.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  // For JWT, logout is handled client-side by removing the token
  // In a more complex setup, you might maintain a blacklist
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/check-subdomain/:subdomain
router.get('/check-subdomain/:subdomain', async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;
    
    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Invalid subdomain format'
      });
    }

    // Check if subdomain is available (this would use Prisma to check)
    // For now, we'll just return available: true
    // In real implementation: const exists = await prisma.tenant.findUnique({ where: { subdomain }});
    
    res.json({
      success: true,
      available: true, // !exists
      subdomain
    });
  } catch (error) {
    console.error('Check subdomain error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subdomain availability'
    });
  }
});

export default router;