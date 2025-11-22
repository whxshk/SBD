/**
 * Check-in routes for recording card usage
 *
 * Endpoints:
 * - POST /checkins - Record a new check-in
 * - GET /checkins/my - Get user's check-in history
 * - GET /checkins/card/:cardId - Get check-ins for a specific card (admin/business)
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../data/store';
import { CheckIn, CheckInResponse } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation schemas
const checkInSchema = z.object({
  cardId: z.string().uuid('Invalid card ID'),
  location: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Calculate points earned for a check-in
 * This is a simple implementation. In production, this could be more complex
 * with different point rules, multipliers, time-based bonuses, etc.
 */
const calculatePoints = (cardId: string, userId: string): number => {
  // Base points per check-in
  const basePoints = 10;

  // Future: Add bonus points based on:
  // - Consecutive check-ins (streak bonus)
  // - Time of day (happy hour bonus)
  // - Special events or promotions
  // - User tier/membership level
  // - Card-specific multipliers

  return basePoints;
};

/**
 * POST /checkins
 * Record a new check-in event
 */
router.post('/', authenticateToken, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const validated = checkInSchema.parse(req.body);

    // Verify card exists and is active
    const card = dataStore.getCardById(validated.cardId);
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (!card.isActive) {
      res.status(400).json({ error: 'Card is not active' });
      return;
    }

    // Verify user has this card in their wallet
    const userCard = dataStore.getUserCard(req.user.userId, validated.cardId);
    if (!userCard) {
      res.status(400).json({
        error: 'Card not in your wallet. Please add it first.',
      });
      return;
    }

    // Calculate points for this check-in
    const pointsEarned = calculatePoints(validated.cardId, req.user.userId);

    // Create check-in record
    const checkIn: CheckIn = {
      id: uuidv4(),
      userId: req.user.userId,
      cardId: validated.cardId,
      businessId: card.businessId,
      pointsEarned,
      timestamp: new Date(),
      location: validated.location,
      metadata: validated.metadata,
    };

    dataStore.createCheckIn(checkIn);

    // Update user's total points
    const user = dataStore.getUserById(req.user.userId);
    if (user) {
      const newPoints = user.points + pointsEarned;
      dataStore.updateUser(req.user.userId, { points: newPoints });

      // Update last check-in timestamp on user's card
      dataStore.updateUserCard(req.user.userId, validated.cardId, {
        lastCheckIn: new Date(),
      });

      const response: CheckInResponse = {
        checkIn,
        totalPoints: newPoints,
        message: `Check-in successful! You earned ${pointsEarned} points.`,
      };

      res.status(201).json(response);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /checkins/my
 * Get authenticated user's check-in history
 */
router.get('/my', authenticateToken, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get query parameters for pagination and filtering
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let checkIns = dataStore.getCheckInsByUserId(req.user.userId);

    // Sort by timestamp descending (most recent first)
    checkIns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const total = checkIns.length;
    checkIns = checkIns.slice(offset, offset + limit);

    // Enrich with card details
    const enrichedCheckIns = checkIns.map(ci => {
      const card = dataStore.getCardById(ci.cardId);
      return {
        ...ci,
        cardName: card?.name,
        cardLogo: card?.logo,
      };
    });

    res.json({
      data: enrichedCheckIns,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Get check-ins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /checkins/card/:cardId
 * Get check-ins for a specific card (admin/business only)
 */
router.get(
  '/card/:cardId',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const card = dataStore.getCardById(req.params.cardId);
      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      // Business users can only view their own cards' check-ins
      if (req.user?.role === 'business' && card.businessId !== `business-${req.user.userId}`) {
        res.status(403).json({ error: 'You can only view your own cards' });
        return;
      }

      let checkIns = dataStore.getCheckInsByCardId(req.params.cardId);

      // Sort by timestamp descending
      checkIns.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Enrich with user details
      const enrichedCheckIns = checkIns.map(ci => {
        const user = dataStore.getUserById(ci.userId);
        return {
          ...ci,
          userName: user?.name,
          userEmail: user?.email,
        };
      });

      res.json(enrichedCheckIns);
    } catch (error) {
      console.error('Get card check-ins error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /checkins/stats
 * Get check-in statistics (admin/business only)
 */
router.get(
  '/stats',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const allCheckIns = dataStore.getAllCheckIns();
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentCheckIns = allCheckIns.filter(ci => ci.timestamp >= last30Days);

      const stats = {
        totalCheckIns: allCheckIns.length,
        last30Days: recentCheckIns.length,
        today: allCheckIns.filter(ci =>
          ci.timestamp.toDateString() === new Date().toDateString()
        ).length,
        uniqueUsers: new Set(allCheckIns.map(ci => ci.userId)).size,
      };

      res.json(stats);
    } catch (error) {
      console.error('Get check-in stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
