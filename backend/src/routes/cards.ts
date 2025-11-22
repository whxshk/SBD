/**
 * Card management routes
 *
 * Endpoints:
 * - GET /cards - Get all available cards
 * - GET /cards/:id - Get specific card details
 * - POST /cards - Create new card (admin/business only)
 * - PUT /cards/:id - Update card (admin/business only)
 * - DELETE /cards/:id - Delete card (admin/business only)
 * - GET /cards/my/wallet - Get user's cards
 * - POST /cards/:id/add - Add card to user's wallet
 * - DELETE /cards/:id/remove - Remove card from user's wallet
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../data/store';
import { Card, UserCard } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Validation schemas
const createCardSchema = z.object({
  name: z.string().min(2, 'Card name must be at least 2 characters'),
  description: z.string().optional(),
  logo: z.string().optional(),
  backgroundColor: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateCardSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  backgroundColor: z.string().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /cards
 * Get all active cards
 */
router.get('/', authenticateToken, (req: Request, res: Response): void => {
  try {
    const cards = dataStore.getAllCards().filter(card => card.isActive);
    res.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /cards/:id
 * Get specific card details
 */
router.get('/:id', authenticateToken, (req: Request, res: Response): void => {
  try {
    const card = dataStore.getCardById(req.params.id);
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /cards
 * Create new card (admin/business only)
 */
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const validated = createCardSchema.parse(req.body);

      // For business users, use their business ID; for admin, use a default business
      const businessId = req.user?.role === 'business'
        ? `business-${req.user.userId}`
        : 'business-1';

      const newCard: Card = {
        id: uuidv4(),
        businessId,
        name: validated.name,
        description: validated.description,
        logo: validated.logo,
        backgroundColor: validated.backgroundColor || '#4ECDC4',
        isActive: true,
        metadata: validated.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const created = dataStore.createCard(newCard);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      console.error('Create card error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PUT /cards/:id
 * Update card (admin/business only)
 */
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const validated = updateCardSchema.parse(req.body);
      const card = dataStore.getCardById(req.params.id);

      if (!card) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }

      // Business users can only update their own cards
      if (req.user?.role === 'business' && card.businessId !== `business-${req.user.userId}`) {
        res.status(403).json({ error: 'You can only update your own cards' });
        return;
      }

      const updated = dataStore.updateCard(req.params.id, validated);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation failed', details: error.errors });
        return;
      }
      console.error('Update card error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /cards/:id
 * Delete card (admin only)
 */
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  (req: Request, res: Response): void => {
    try {
      const deleted = dataStore.deleteCard(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Card not found' });
        return;
      }
      res.json({ message: 'Card deleted successfully' });
    } catch (error) {
      console.error('Delete card error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /cards/my/wallet
 * Get user's cards in their wallet
 */
router.get('/my/wallet', authenticateToken, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const userCards = dataStore.getUserCards(req.user.userId);

    // Enrich with card details
    const enrichedCards = userCards.map(uc => {
      const card = dataStore.getCardById(uc.cardId);
      return {
        ...uc,
        card,
      };
    });

    res.json(enrichedCards);
  } catch (error) {
    console.error('Get user cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /cards/:id/add
 * Add card to user's wallet
 */
router.post('/:id/add', authenticateToken, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const card = dataStore.getCardById(req.params.id);
    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    if (!card.isActive) {
      res.status(400).json({ error: 'Card is not active' });
      return;
    }

    // Check if already added
    const existing = dataStore.getUserCard(req.user.userId, req.params.id);
    if (existing) {
      res.status(400).json({ error: 'Card already in wallet' });
      return;
    }

    const userCard: UserCard = {
      id: uuidv4(),
      userId: req.user.userId,
      cardId: req.params.id,
      addedAt: new Date(),
    };

    const created = dataStore.addCardToUser(userCard);
    res.status(201).json({ ...created, card });
  } catch (error) {
    console.error('Add card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /cards/:id/remove
 * Remove card from user's wallet
 */
router.delete('/:id/remove', authenticateToken, (req: Request, res: Response): void => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const removed = dataStore.removeCardFromUser(req.user.userId, req.params.id);
    if (!removed) {
      res.status(404).json({ error: 'Card not in wallet' });
      return;
    }

    res.json({ message: 'Card removed from wallet' });
  } catch (error) {
    console.error('Remove card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
