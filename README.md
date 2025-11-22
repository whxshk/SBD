# SharkBand

A complete cross-platform digital wallet system for managing virtual ID, loyalty, and access cards with business analytics.

## Overview

SharkBand is a full-stack application consisting of:

1. **Mobile App (Flutter)**: Cross-platform iOS/Android wallet app for users
2. **Web Dashboard (React)**: Admin and business portal for analytics and management
3. **Backend API (Node.js)**: RESTful API with JWT authentication

## Features

### For Users (Mobile App)
- ✅ Secure login and registration
- 💳 Digital wallet for storing cards
- ⚡ One-tap check-in functionality
- 🏆 Points tracking and rewards
- 📊 Personal activity charts
- 📜 Check-in history

### For Businesses (Web Dashboard)
- 📈 Real-time analytics dashboard
- 📇 Card creation and management
- 👥 User leaderboard
- 📊 Interactive charts (daily trends, card performance)
- 🎯 Business insights and metrics

## Quick Start

### Prerequisites

- Node.js (v16+)
- Flutter SDK (3.0+)
- npm or yarn

### 1. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API will run on `http://localhost:3000`

### 2. Start the Mobile App

```bash
cd mobile
flutter pub get
flutter run
```

**Note**: Update the API URL in `lib/services/api_service.dart`:
- iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical Device: `http://YOUR_IP:3000/api`

### 3. Start the Dashboard

```bash
cd dashboard
npm install
cp .env.example .env
npm start
```

The dashboard will open at `http://localhost:3001`

## Project Structure

```
SBD/
├── backend/              # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth middleware
│   │   ├── data/         # In-memory data store
│   │   └── types.ts      # Type definitions
│   ├── package.json
│   └── README.md
│
├── mobile/               # Flutter mobile app
│   ├── lib/
│   │   ├── models/       # Data models
│   │   ├── providers/    # State management
│   │   ├── services/     # API services
│   │   └── screens/      # UI screens
│   ├── pubspec.yaml
│   └── README.md
│
├── dashboard/            # React web dashboard
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   └── types.ts      # Type definitions
│   ├── package.json
│   └── README.md
│
└── README.md             # This file
```

## Architecture

### Backend API

**Tech Stack**: Node.js, Express, TypeScript, JWT, Bcrypt, Zod

**Key Features**:
- JWT-based authentication
- Role-based access control (user, business, admin)
- RESTful API design
- In-memory data store (easily swappable)
- Input validation with Zod
- Modular route structure

**Endpoints**:
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
GET    /api/auth/me                # Get current user

GET    /api/cards                  # List all cards
POST   /api/cards                  # Create card (admin/business)
PUT    /api/cards/:id              # Update card
DELETE /api/cards/:id              # Delete card (admin)
GET    /api/cards/my/wallet        # Get user's cards
POST   /api/cards/:id/add          # Add card to wallet

POST   /api/checkins               # Record check-in
GET    /api/checkins/my            # Get user's check-ins
GET    /api/checkins/card/:id      # Get card check-ins (admin/business)

GET    /api/analytics/overview     # Overall analytics
GET    /api/analytics/cards        # Card statistics
GET    /api/analytics/daily        # Daily trends
GET    /api/analytics/leaderboard  # Top users
```

### Mobile App

**Tech Stack**: Flutter, Provider, HTTP, FlutterSecureStorage, FL Chart

**Screens**:
- Login/Register
- Wallet (card list)
- Card Detail (with check-in)
- Add Card (browse available cards)
- Profile (points, history, charts)

**State Management**: Provider pattern for auth state

**Features**:
- Secure token storage
- Beautiful card UI with gradients
- Animated check-in button
- Bar chart for 7-day activity
- Pull-to-refresh

### Web Dashboard

**Tech Stack**: React, TypeScript, React Router, Recharts, Axios

**Pages**:
- Login
- Dashboard (analytics with charts)
- Cards (management interface)

**Charts**:
- Daily check-ins (line chart)
- Card performance (bar chart)
- User leaderboard (table)
- Stats cards (overview metrics)

## Default Demo Data

The backend initializes with demo cards:

1. **Coffee Loyalty Card** ☕
   - Buy 10 coffees, get 1 free
   - Background: Brown (#6F4E37)

2. **Gym Membership** 💪
   - Track your gym visits and earn rewards
   - Background: Red (#FF6B6B)

3. **VIP Access Pass** ⭐
   - Exclusive access to premium events
   - Background: Teal (#4ECDC4)

## User Roles

### User (Default)
- Access mobile app
- Add cards to wallet
- Check in to earn points
- View personal history

### Business
- Access web dashboard
- Create and manage cards
- View analytics
- Cannot delete cards

### Admin
- Full access to dashboard
- Create, edit, delete cards
- View all analytics
- User management

## API Authentication

All requests (except login/register) require JWT token:

```typescript
// Request Header
Authorization: Bearer <jwt-token>

// Token contains:
{
  userId: string,
  email: string,
  role: 'user' | 'admin' | 'business'
}
```

Tokens are stored:
- Mobile: FlutterSecureStorage
- Dashboard: localStorage

## Points System

- Base points per check-in: **10 points**
- Points are accumulated across all cards
- Visible on profile screen and leaderboard

**Future enhancements**:
- Streak bonuses (consecutive days)
- Time-based multipliers (happy hours)
- Card-specific rules
- Redemption system

## Development Workflow

### Creating a New Feature

1. **Backend**: Add route in `backend/src/routes/`
2. **Mobile**: Add screen in `mobile/lib/screens/`
3. **Dashboard**: Add page in `dashboard/src/pages/`
4. Update types in respective `types.ts` files
5. Update API service methods
6. Test end-to-end

### Example: Adding "Favorites" Feature

**Backend** (`backend/src/routes/favorites.ts`):
```typescript
router.post('/favorites/:cardId', authenticateToken, async (req, res) => {
  // Implementation
});
```

**Mobile** (`mobile/lib/services/api_service.dart`):
```dart
Future<void> addToFavorites(String cardId) async {
  await client.post('/favorites/$cardId');
}
```

**Dashboard** (`dashboard/src/services/api.ts`):
```typescript
async addToFavorites(cardId: string): Promise<void> {
  await this.client.post(`/favorites/${cardId}`);
}
```

## Database Migration

The backend uses in-memory storage. To migrate to a real database:

### PostgreSQL with Prisma

1. **Install Prisma**:
```bash
cd backend
npm install prisma @prisma/client
npx prisma init
```

2. **Define schema** (`prisma/schema.prisma`):
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      String
  points    Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Card {
  id              String   @id @default(uuid())
  businessId      String
  name            String
  description     String?
  logo            String?
  backgroundColor String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

3. **Update data store** (`backend/src/data/store.ts`):
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Replace Map operations with Prisma queries
async getUserById(id: string) {
  return await prisma.user.findUnique({ where: { id } });
}
```

4. **Run migrations**:
```bash
npx prisma migrate dev
```

## Environment Variables

### Backend (.env)
```env
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/sharkband
```

### Dashboard (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### Mobile
Update `baseUrl` in `lib/services/api_service.dart`

## Future Enhancements

### High Priority
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] NFC/QR code scanning for check-ins
- [ ] Push notifications
- [ ] Apple/Google Wallet integration
- [ ] Geolocation verification

### Medium Priority
- [ ] Social features (friends, sharing)
- [ ] Advanced gamification (streaks, achievements)
- [ ] Business settings page
- [ ] User management for admins
- [ ] Export analytics (CSV, PDF)

### Low Priority
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Wearable device support
- [ ] Payment integration
- [ ] Email notifications

## Security Considerations

✅ **Current**:
- JWT authentication
- Password hashing (bcrypt)
- Input validation (Zod)
- Secure token storage
- CORS enabled

⚠️ **Production Recommendations**:
- Use HTTPS only
- Implement rate limiting
- Add refresh tokens
- Enable CSRF protection
- Use environment-specific secrets
- Implement audit logging
- Add 2FA for admin accounts

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see individual project READMEs for details

---

**Built with ❤️ for digital wallet innovation**