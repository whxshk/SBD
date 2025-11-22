/**
 * Authentication routes for user registration and login
 *
 * Endpoints:
 * - POST /auth/register - Create new user account
 * - POST /auth/login - Authenticate and get JWT token
 * - GET /auth/me - Get current user profile (protected)
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../data/store';
import { User, AuthResponse, JwtPayload } from '../types';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['user', 'admin', 'business']).optional().default('user'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /auth/register
 * Register a new user account
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validated = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = dataStore.getUserByEmail(validated.email);
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email: validated.email,
      password: hashedPassword,
      name: validated.name,
      role: validated.role,
      points: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dataStore.createUser(newUser);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const payload: JwtPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn });

    // Return response (exclude password)
    const { password, ...userWithoutPassword } = newUser;
    const response: AuthResponse = {
      token,
      user: userWithoutPassword,
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validated = loginSchema.parse(req.body);

    // Find user by email
    const user = dataStore.getUserByEmail(validated.email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validated.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn });

    // Return response (exclude password)
    const { password, ...userWithoutPassword } = user;
    const response: AuthResponse = {
      token,
      user: userWithoutPassword,
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /auth/me
 * Get current authenticated user's profile
 */
router.get('/me', authenticateToken, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = dataStore.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
