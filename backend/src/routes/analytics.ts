/**
 * Analytics routes for business insights and statistics
 *
 * Endpoints:
 * - GET /analytics/overview - Overall system analytics
 * - GET /analytics/cards - Per-card statistics
 * - GET /analytics/daily - Daily check-in trends
 * - GET /analytics/leaderboard - Top users by points
 */

import { Router, Request, Response } from 'express';
import { dataStore } from '../data/store';
import {
  AnalyticsResponse,
  CheckInStats,
  DailyCheckIn,
  UserLeaderboard,
} from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * Helper function to format date as YYYY-MM-DD
 */
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Helper function to get date range
 */
const getDateRange = (days: number): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

/**
 * GET /analytics/overview
 * Get comprehensive analytics overview
 */
router.get(
  '/overview',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const users = dataStore.getAllUsers();
      const cards = dataStore.getAllCards();
      const allCheckIns = dataStore.getAllCheckIns();

      // Calculate active users (users with check-ins in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUserIds = new Set(
        allCheckIns
          .filter(ci => ci.timestamp >= thirtyDaysAgo)
          .map(ci => ci.userId)
      );

      // Calculate card statistics
      const cardStats: CheckInStats[] = cards.map(card => {
        const cardCheckIns = allCheckIns.filter(ci => ci.cardId === card.id);
        const uniqueUsers = new Set(cardCheckIns.map(ci => ci.userId));

        return {
          cardId: card.id,
          cardName: card.name,
          totalCheckIns: cardCheckIns.length,
          uniqueUsers: uniqueUsers.size,
        };
      });

      // Calculate daily check-ins for last 30 days
      const { start, end } = getDateRange(30);
      const recentCheckIns = allCheckIns.filter(
        ci => ci.timestamp >= start && ci.timestamp <= end
      );

      const dailyMap = new Map<string, number>();
      recentCheckIns.forEach(ci => {
        const dateKey = formatDate(ci.timestamp);
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + 1);
      });

      const dailyCheckIns: DailyCheckIn[] = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = formatDate(d);
        dailyCheckIns.push({
          date: dateKey,
          count: dailyMap.get(dateKey) || 0,
        });
      }

      // Calculate leaderboard
      const topUsers: UserLeaderboard[] = users
        .filter(u => u.role === 'user')
        .sort((a, b) => b.points - a.points)
        .slice(0, 10)
        .map((user, index) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          points: user.points,
          rank: index + 1,
        }));

      const response: AnalyticsResponse = {
        totalUsers: users.filter(u => u.role === 'user').length,
        totalCards: cards.length,
        totalCheckIns: allCheckIns.length,
        activeUsers: activeUserIds.size,
        cardStats,
        dailyCheckIns,
        topUsers,
      };

      res.json(response);
    } catch (error) {
      console.error('Analytics overview error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /analytics/cards
 * Get detailed statistics per card
 */
router.get(
  '/cards',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const cards = dataStore.getAllCards();
      const allCheckIns = dataStore.getAllCheckIns();

      const cardAnalytics = cards.map(card => {
        const cardCheckIns = allCheckIns.filter(ci => ci.cardId === card.id);
        const uniqueUsers = new Set(cardCheckIns.map(ci => ci.userId));

        // Calculate average check-ins per user
        const avgCheckInsPerUser = uniqueUsers.size > 0
          ? cardCheckIns.length / uniqueUsers.size
          : 0;

        // Calculate check-ins in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentCheckIns = cardCheckIns.filter(ci => ci.timestamp >= sevenDaysAgo);

        // Get total users who have added this card
        const userCards = dataStore.getAllCards(); // This should be getUserCards but filtered by cardId
        // For now, use unique users from check-ins as proxy

        return {
          card,
          stats: {
            totalCheckIns: cardCheckIns.length,
            uniqueUsers: uniqueUsers.size,
            avgCheckInsPerUser: Math.round(avgCheckInsPerUser * 10) / 10,
            last7Days: recentCheckIns.length,
            totalPointsEarned: cardCheckIns.reduce((sum, ci) => sum + ci.pointsEarned, 0),
          },
        };
      });

      res.json(cardAnalytics);
    } catch (error) {
      console.error('Card analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /analytics/daily
 * Get daily check-in trends with customizable date range
 */
router.get(
  '/daily',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const { start, end } = getDateRange(days);

      const checkIns = dataStore.getCheckInsInDateRange(start, end);

      // Group by date and card
      const dailyByCard = new Map<string, Map<string, number>>();

      checkIns.forEach(ci => {
        const dateKey = formatDate(ci.timestamp);
        const card = dataStore.getCardById(ci.cardId);

        if (!dailyByCard.has(dateKey)) {
          dailyByCard.set(dateKey, new Map());
        }

        const dayMap = dailyByCard.get(dateKey)!;
        const cardName = card?.name || 'Unknown';
        dayMap.set(cardName, (dayMap.get(cardName) || 0) + 1);
      });

      // Convert to array format
      const result = Array.from(dailyByCard.entries()).map(([date, cards]) => ({
        date,
        total: Array.from(cards.values()).reduce((sum, count) => sum + count, 0),
        byCard: Object.fromEntries(cards),
      }));

      result.sort((a, b) => a.date.localeCompare(b.date));

      res.json(result);
    } catch (error) {
      console.error('Daily analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /analytics/leaderboard
 * Get top users by points
 */
router.get(
  '/leaderboard',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const users = dataStore.getAllUsers();

      const leaderboard: UserLeaderboard[] = users
        .filter(u => u.role === 'user')
        .sort((a, b) => b.points - a.points)
        .slice(0, limit)
        .map((user, index) => ({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          points: user.points,
          rank: index + 1,
        }));

      res.json(leaderboard);
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /analytics/user-activity
 * Get user activity metrics
 */
router.get(
  '/user-activity',
  authenticateToken,
  requireRole('admin', 'business'),
  (req: Request, res: Response): void => {
    try {
      const users = dataStore.getAllUsers().filter(u => u.role === 'user');
      const allCheckIns = dataStore.getAllCheckIns();

      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const activity = {
        totalUsers: users.length,
        usersWithCheckIns: new Set(allCheckIns.map(ci => ci.userId)).size,
        activeLastWeek: new Set(
          allCheckIns.filter(ci => ci.timestamp >= last7Days).map(ci => ci.userId)
        ).size,
        activeLastMonth: new Set(
          allCheckIns.filter(ci => ci.timestamp >= last30Days).map(ci => ci.userId)
        ).size,
        avgCheckInsPerUser: users.length > 0
          ? Math.round((allCheckIns.length / users.length) * 10) / 10
          : 0,
      };

      res.json(activity);
    } catch (error) {
      console.error('User activity error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
