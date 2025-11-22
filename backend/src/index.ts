/**
 * SharkBand Backend API Server
 *
 * Main entry point for the Express server.
 * Sets up middleware, routes, and starts the HTTP server.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import cardRoutes from './routes/cards';
import checkInRoutes from './routes/checkins';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SharkBand API',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to SharkBand API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      cards: '/api/cards',
      checkins: '/api/checkins',
      analytics: '/api/analytics',
    },
    documentation: 'See README.md for API documentation',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🦈 SharkBand API Server');
  console.log('='.repeat(50));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/me');
  console.log('  GET    /api/cards');
  console.log('  GET    /api/cards/my/wallet');
  console.log('  POST   /api/cards/:id/add');
  console.log('  POST   /api/checkins');
  console.log('  GET    /api/checkins/my');
  console.log('  GET    /api/analytics/overview');
  console.log('='.repeat(50));
});

export default app;
