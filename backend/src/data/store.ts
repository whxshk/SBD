/**
 * In-memory data store for SharkBand
 *
 * This is a simple implementation for the prototype. In production, this should be
 * replaced with a proper database (SQLite, PostgreSQL, MongoDB, etc.).
 *
 * Future considerations:
 * - Implement database abstraction layer (repository pattern)
 * - Use Prisma ORM for type-safe database access
 * - Add data persistence (currently all data is lost on server restart)
 * - Implement proper indexing for performance
 */

import { User, Card, UserCard, CheckIn, Business } from '../types';

class DataStore {
  private users: Map<string, User> = new Map();
  private cards: Map<string, Card> = new Map();
  private userCards: Map<string, UserCard> = new Map();
  private checkIns: CheckIn[] = [];
  private businesses: Map<string, Business> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // User operations
  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Card operations
  createCard(card: Card): Card {
    this.cards.set(card.id, card);
    return card;
  }

  getCardById(id: string): Card | undefined {
    return this.cards.get(id);
  }

  getAllCards(): Card[] {
    return Array.from(this.cards.values());
  }

  getCardsByBusinessId(businessId: string): Card[] {
    return Array.from(this.cards.values()).filter(c => c.businessId === businessId);
  }

  updateCard(id: string, updates: Partial<Card>): Card | undefined {
    const card = this.cards.get(id);
    if (!card) return undefined;

    const updated = { ...card, ...updates, updatedAt: new Date() };
    this.cards.set(id, updated);
    return updated;
  }

  deleteCard(id: string): boolean {
    return this.cards.delete(id);
  }

  // UserCard operations
  addCardToUser(userCard: UserCard): UserCard {
    const key = `${userCard.userId}-${userCard.cardId}`;
    this.userCards.set(key, userCard);
    return userCard;
  }

  getUserCards(userId: string): UserCard[] {
    return Array.from(this.userCards.values()).filter(uc => uc.userId === userId);
  }

  getUserCard(userId: string, cardId: string): UserCard | undefined {
    const key = `${userId}-${cardId}`;
    return this.userCards.get(key);
  }

  updateUserCard(userId: string, cardId: string, updates: Partial<UserCard>): UserCard | undefined {
    const key = `${userId}-${cardId}`;
    const userCard = this.userCards.get(key);
    if (!userCard) return undefined;

    const updated = { ...userCard, ...updates };
    this.userCards.set(key, updated);
    return updated;
  }

  removeCardFromUser(userId: string, cardId: string): boolean {
    const key = `${userId}-${cardId}`;
    return this.userCards.delete(key);
  }

  // Check-in operations
  createCheckIn(checkIn: CheckIn): CheckIn {
    this.checkIns.push(checkIn);
    return checkIn;
  }

  getCheckInsByUserId(userId: string): CheckIn[] {
    return this.checkIns.filter(c => c.userId === userId);
  }

  getCheckInsByCardId(cardId: string): CheckIn[] {
    return this.checkIns.filter(c => c.cardId === cardId);
  }

  getCheckInsByBusinessId(businessId: string): CheckIn[] {
    return this.checkIns.filter(c => c.businessId === businessId);
  }

  getAllCheckIns(): CheckIn[] {
    return this.checkIns;
  }

  getCheckInsInDateRange(startDate: Date, endDate: Date): CheckIn[] {
    return this.checkIns.filter(c =>
      c.timestamp >= startDate && c.timestamp <= endDate
    );
  }

  // Business operations
  createBusiness(business: Business): Business {
    this.businesses.set(business.id, business);
    return business;
  }

  getBusinessById(id: string): Business | undefined {
    return this.businesses.get(id);
  }

  getAllBusinesses(): Business[] {
    return Array.from(this.businesses.values());
  }

  // Initialize with mock data for testing
  private initializeMockData(): void {
    // Create a demo business
    const demoBusiness: Business = {
      id: 'business-1',
      name: 'SharkBand Demo Business',
      email: 'demo@sharkband.com',
      ownerId: 'admin-1',
      logo: 'https://via.placeholder.com/150',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.createBusiness(demoBusiness);

    // Create demo cards
    const cards: Card[] = [
      {
        id: 'card-1',
        businessId: 'business-1',
        name: 'Coffee Loyalty Card',
        description: 'Buy 10 coffees, get 1 free!',
        logo: '☕',
        backgroundColor: '#6F4E37',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-2',
        businessId: 'business-1',
        name: 'Gym Membership',
        description: 'Track your gym visits and earn rewards',
        logo: '💪',
        backgroundColor: '#FF6B6B',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-3',
        businessId: 'business-1',
        name: 'VIP Access Pass',
        description: 'Exclusive access to premium events',
        logo: '⭐',
        backgroundColor: '#4ECDC4',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    cards.forEach(card => this.createCard(card));
  }

  // Utility method for clearing all data (useful for testing)
  clearAll(): void {
    this.users.clear();
    this.cards.clear();
    this.userCards.clear();
    this.checkIns = [];
    this.businesses.clear();
    this.initializeMockData();
  }
}

// Export singleton instance
export const dataStore = new DataStore();
