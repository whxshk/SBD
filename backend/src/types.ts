/**
 * Core type definitions for SharkBand backend
 * These interfaces define the data models for users, cards, check-ins, and businesses
 */

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: 'user' | 'admin' | 'business';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  businessId: string; // ID of the business that issued this card
  name: string;
  description?: string;
  logo?: string; // URL or base64 encoded image
  backgroundColor?: string;
  isActive: boolean;
  metadata?: Record<string, any>; // Additional custom fields
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCard {
  id: string;
  userId: string;
  cardId: string;
  addedAt: Date;
  lastCheckIn?: Date;
}

export interface CheckIn {
  id: string;
  userId: string;
  cardId: string;
  businessId: string;
  pointsEarned: number;
  timestamp: Date;
  location?: string; // Future: GPS coordinates
  metadata?: Record<string, any>; // Future: NFC/QR data, device info, etc.
}

export interface Business {
  id: string;
  name: string;
  email: string;
  ownerId: string; // User ID of the business owner
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request payload types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin' | 'business';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateCardRequest {
  name: string;
  description?: string;
  logo?: string;
  backgroundColor?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCardRequest {
  name?: string;
  description?: string;
  logo?: string;
  backgroundColor?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface CheckInRequest {
  cardId: string;
  location?: string;
  metadata?: Record<string, any>;
}

// Response types
export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface CheckInResponse {
  checkIn: CheckIn;
  totalPoints: number;
  message: string;
}

// Analytics types
export interface CheckInStats {
  cardId: string;
  cardName: string;
  totalCheckIns: number;
  uniqueUsers: number;
}

export interface DailyCheckIn {
  date: string; // YYYY-MM-DD
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
  activeUsers: number; // Users with check-ins in last 30 days
  cardStats: CheckInStats[];
  dailyCheckIns: DailyCheckIn[];
  topUsers: UserLeaderboard[];
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Express Request extension with authenticated user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
