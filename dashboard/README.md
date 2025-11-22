# SharkBand Dashboard

React-based web dashboard for SharkBand business and admin users.

## Features

- **Admin Login**: Secure authentication for admin and business users
- **Card Management**: Create, edit, and manage loyalty/access cards
- **Analytics Dashboard**: Comprehensive business insights with charts
- **User Leaderboard**: View top users by points
- **Real-time Data**: Live statistics and metrics

## Tech Stack

- React 18
- TypeScript
- React Router v6
- Recharts (data visualization)
- Axios (HTTP client)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running SharkBand backend server

### Installation

```bash
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Update .env with your backend URL
# REACT_APP_API_URL=http://localhost:3000/api
```

### Running the Dashboard

```bash
# Start development server
npm start

# The dashboard will open at http://localhost:3001
```

### Building for Production

```bash
# Create production build
npm run build

# The optimized build will be in the /build directory
```

## Project Structure

```
dashboard/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Layout.tsx          # Main layout with sidebar
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Login.tsx           # Login page
│   │   ├── Login.css
│   │   ├── Dashboard.tsx       # Analytics dashboard
│   │   ├── Dashboard.css
│   │   ├── Cards.tsx           # Card management
│   │   └── Cards.css
│   ├── services/
│   │   └── api.ts              # API service layer
│   ├── types.ts                # TypeScript type definitions
│   ├── App.tsx                 # Main app component
│   ├── App.css
│   └── index.tsx               # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Features Overview

### Authentication

- Login with admin/business credentials
- JWT token-based authentication
- Automatic redirect on unauthorized access
- Secure token storage in localStorage

### Dashboard Analytics

- **Overview Stats**: Total users, cards, check-ins, active users
- **Daily Check-ins Chart**: Line chart showing trends over 30 days
- **Card Performance**: Bar chart comparing check-ins and unique users per card
- **User Leaderboard**: Top 10 users by points with ranking
- **Card Statistics**: Detailed table with metrics per card

### Card Management

- **View All Cards**: Grid view of all loyalty/access cards
- **Create Card**: Modal form to add new cards
  - Name, description, logo (emoji), background color
  - Visual card preview
- **Edit Cards**: Activate/deactivate cards
- **Delete Cards**: Remove cards (admin only)
- **Real-time Updates**: Changes reflect immediately

## API Integration

The dashboard communicates with the backend via RESTful API:

```typescript
// Login
POST /api/auth/login

// Get analytics
GET /api/analytics/overview
GET /api/analytics/cards
GET /api/analytics/daily
GET /api/analytics/leaderboard

// Card management
GET /api/cards
POST /api/cards
PUT /api/cards/:id
DELETE /api/cards/:id
```

All authenticated requests include JWT token:
```
Authorization: Bearer <token>
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:3000/api
```

For production, update to your deployed backend URL.

### CORS Configuration

Ensure your backend allows requests from the dashboard URL. In the backend, CORS is already enabled for all origins in development.

## User Roles

The dashboard supports two roles:

1. **Admin**: Full access to all features, can delete cards
2. **Business**: Can manage their own cards, view analytics

Regular users cannot access the dashboard (redirected with error message).

## Charts and Visualizations

Using Recharts library for data visualization:

- **LineChart**: Daily check-ins trend
- **BarChart**: Card performance comparison
- **Responsive**: Charts adapt to screen size
- **Interactive**: Tooltips on hover

## Styling

- Clean, modern UI with gradient theme
- Responsive design (mobile-friendly)
- CSS modules for component-specific styles
- Consistent color scheme:
  - Primary: Purple gradient (#667eea to #764ba2)
  - Accent colors for stats cards
  - White cards on light gray background

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Code Structure

- **Pages**: Top-level route components
- **Components**: Reusable UI components
- **Services**: API and business logic
- **Types**: Shared TypeScript interfaces

## Deployment

### Deploy to Netlify

```bash
npm run build

# Drag /build folder to Netlify
```

### Deploy to Vercel

```bash
npm run build

# Connect GitHub repo to Vercel
```

### Deploy to Static Hosting

The `/build` directory contains static files that can be served by any web server (nginx, Apache, etc.).

## Future Enhancements

### Planned Features

1. **Advanced Filtering**: Filter analytics by date range, card, or user
2. **Export Data**: Download analytics as CSV/PDF
3. **Real-time Updates**: WebSocket connection for live data
4. **User Management**: View and manage user accounts
5. **Business Settings**: Configure business profile and preferences
6. **Notifications**: In-app notifications for important events
7. **Dark Mode**: Toggle between light and dark themes
8. **Multi-language**: i18n support

### Extensibility Points

#### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `Layout.tsx`

```typescript
// App.tsx
<Route path="users" element={<Users />} />

// Layout.tsx
<NavLink to="/users">
  <span className="nav-icon">👥</span>
  <span>Users</span>
</NavLink>
```

#### Adding New Charts

Use Recharts components:

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

<LineChart data={data}>
  <XAxis dataKey="date" />
  <YAxis />
  <Line dataKey="value" stroke="#667eea" />
</LineChart>
```

#### Custom API Calls

Add methods to `apiService`:

```typescript
// src/services/api.ts
async getCustomData() {
  const response = await this.client.get('/custom-endpoint');
  return response.data;
}
```

## Troubleshooting

### Cannot connect to backend

- Verify backend is running on correct port
- Check `REACT_APP_API_URL` in `.env`
- Ensure CORS is enabled on backend

### Token expired errors

- Login again to refresh token
- Check backend JWT_EXPIRES_IN setting

### Charts not displaying

- Verify data format matches Recharts requirements
- Check browser console for errors
- Ensure Recharts is installed: `npm install recharts`

## Performance Optimization

- Lazy loading for routes (future)
- Memoization of chart data
- Debounced API calls
- Efficient re-rendering with React.memo

## Security

- JWT tokens stored in localStorage
- Automatic logout on 401 errors
- Role-based access control
- Input validation on forms
- XSS protection via React

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When adding features:
1. Follow existing code structure
2. Add TypeScript types
3. Update this README
4. Test on multiple screen sizes

## License

MIT
