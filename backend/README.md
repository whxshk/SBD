# SharkBand Backend API

Node.js + Express + TypeScript backend server for the SharkBand wallet application.

## Features

- **JWT Authentication**: Secure user registration and login
- **Card Management**: CRUD operations for loyalty/access cards
- **Check-in System**: Record user check-ins and track points
- **Analytics**: Business insights and user statistics
- **Role-based Access**: Support for user, business, and admin roles

## Tech Stack

- Node.js
- Express.js
- TypeScript
- JWT (jsonwebtoken)
- Bcrypt (password hashing)
- Zod (validation)
- In-memory data store (easily replaceable with database)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# Important: Change JWT_SECRET in production!
```

### Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Cards

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cards` | Get all active cards | Yes |
| GET | `/api/cards/:id` | Get card details | Yes |
| POST | `/api/cards` | Create new card | Yes (admin/business) |
| PUT | `/api/cards/:id` | Update card | Yes (admin/business) |
| DELETE | `/api/cards/:id` | Delete card | Yes (admin) |
| GET | `/api/cards/my/wallet` | Get user's cards | Yes |
| POST | `/api/cards/:id/add` | Add card to wallet | Yes |
| DELETE | `/api/cards/:id/remove` | Remove card from wallet | Yes |

### Check-ins

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/checkins` | Record check-in | Yes |
| GET | `/api/checkins/my` | Get user's check-in history | Yes |
| GET | `/api/checkins/card/:cardId` | Get card check-ins | Yes (admin/business) |
| GET | `/api/checkins/stats` | Get check-in statistics | Yes (admin/business) |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/overview` | Overall analytics | Yes (admin/business) |
| GET | `/api/analytics/cards` | Card statistics | Yes (admin/business) |
| GET | `/api/analytics/daily` | Daily trends | Yes (admin/business) |
| GET | `/api/analytics/leaderboard` | Top users by points | Yes (admin/business) |
| GET | `/api/analytics/user-activity` | User activity metrics | Yes (admin/business) |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Registration Request

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Example Login Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Example Authenticated Request

```bash
curl -X GET http://localhost:3000/api/cards/my/wallet \
  -H "Authorization: Bearer <your-token>"
```

## Data Models

### User

```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'business';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Card

```typescript
{
  id: string;
  businessId: string;
  name: string;
  description?: string;
  logo?: string;
  backgroundColor?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

### CheckIn

```typescript
{
  id: string;
  userId: string;
  cardId: string;
  businessId: string;
  pointsEarned: number;
  timestamp: Date;
  location?: string;
  metadata?: Record<string, any>;
}
```

## Project Structure

```
backend/
├── src/
│   ├── data/
│   │   └── store.ts           # In-memory data store
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Authentication routes
│   │   ├── cards.ts           # Card management routes
│   │   ├── checkins.ts        # Check-in routes
│   │   └── analytics.ts       # Analytics routes
│   ├── types.ts               # TypeScript type definitions
│   └── index.ts               # Main server file
├── .env                       # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Future Enhancements

### Database Integration

Currently using in-memory storage. To migrate to a database:

1. **Install Prisma (recommended)**:
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Define schema** in `prisma/schema.prisma`

3. **Replace `dataStore`** in `src/data/store.ts` with Prisma client

4. **Example Prisma setup**:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   const prisma = new PrismaClient();
   ```

### Additional Features

- **NFC/QR Code scanning**: Add support for physical card scanning
- **Payment integration**: Stripe/PayPal for premium features
- **Push notifications**: Notify users of rewards and promotions
- **Geolocation**: Verify check-ins at physical locations
- **Advanced gamification**: Streaks, achievements, badges
- **Social features**: Share achievements, friend leaderboards
- **Apple/Google Wallet integration**: Native wallet pass support
- **Rate limiting**: Prevent abuse with express-rate-limit
- **API documentation**: Add Swagger/OpenAPI documentation
- **Testing**: Jest unit and integration tests
- **Docker**: Containerization for easy deployment

### Points System Enhancement

The current points system (`calculatePoints` in `src/routes/checkins.ts`) is basic. Future enhancements:

- Streak bonuses (consecutive days)
- Time-based multipliers (happy hours)
- Card-specific point rules
- Seasonal promotions
- Referral bonuses
- Milestone rewards

### Security Improvements

- Input sanitization
- Rate limiting on auth endpoints
- Refresh token rotation
- Password reset flow
- Email verification
- Two-factor authentication
- API key authentication for business partners

## Development

### Adding a New Route

1. Create route file in `src/routes/`
2. Import and register in `src/index.ts`
3. Add middleware as needed
4. Update this README

### Adding New Data Models

1. Define interfaces in `src/types.ts`
2. Add methods to `src/data/store.ts`
3. Create validation schemas (Zod)
4. Implement routes

## Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

### JWT Token Invalid

- Check JWT_SECRET matches between requests
- Verify token hasn't expired
- Ensure Authorization header format: `Bearer <token>`

## License

MIT
