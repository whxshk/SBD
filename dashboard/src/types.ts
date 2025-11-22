/**
 * Type definitions for SharkBand Dashboard
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'business';
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Card {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  logo?: string;
  backgroundColor?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInStats {
  cardId: string;
  cardName: string;
  totalCheckIns: number;
  uniqueUsers: number;
}

export interface DailyCheckIn {
  date: string;
  count: number;
}

export interface UserLeaderboard {
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
  rank: number;
}

export interface AnalyticsResponse {
  totalUsers: number;
  totalCards: number;
  totalCheckIns: number;
  activeUsers: number;
  cardStats: CheckInStats[];
  dailyCheckIns: DailyCheckIn[];
  topUsers: UserLeaderboard[];
}

export interface CardAnalytics {
  card: Card;
  stats: {
    totalCheckIns: number;
    uniqueUsers: number;
    avgCheckInsPerUser: number;
    last7Days: number;
    totalPointsEarned: number;
  };
}
