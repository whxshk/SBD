# SharkBand Mobile App

Flutter-based cross-platform mobile wallet application for iOS and Android.

## Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Digital Wallet**: Manage loyalty and access cards
- **Check-in System**: Record visits and earn points
- **Points Tracking**: View total points and check-in history
- **Activity Charts**: Visualize check-in patterns over time
- **Secure Storage**: JWT tokens stored securely using FlutterSecureStorage

## Tech Stack

- Flutter 3.x
- Provider (State Management)
- HTTP (API Communication)
- FlutterSecureStorage (Secure Token Storage)
- FL Chart (Data Visualization)

## Getting Started

### Prerequisites

- Flutter SDK (3.0 or higher)
- Dart SDK
- Android Studio / Xcode (for iOS)
- Running SharkBand backend server

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
flutter pub get

# Run the app
flutter run
```

### Configuration

Before running the app, update the API base URL in `lib/services/api_service.dart`:

```dart
// For local development
static const String baseUrl = 'http://localhost:3000/api';  // iOS Simulator

// For Android Emulator
static const String baseUrl = 'http://10.0.2.2:3000/api';

// For physical device (replace with your computer's IP)
static const String baseUrl = 'http://192.168.1.xxx:3000/api';
```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── user.dart
│   ├── card.dart
│   └── checkin.dart
├── providers/                # State management
│   └── auth_provider.dart
├── services/                 # API services
│   └── api_service.dart
└── screens/                  # UI screens
    ├── auth/
    │   ├── login_screen.dart
    │   └── register_screen.dart
    ├── home/
    │   └── home_screen.dart
    ├── wallet/
    │   ├── wallet_screen.dart
    │   ├── card_detail_screen.dart
    │   └── add_card_screen.dart
    └── profile/
        └── profile_screen.dart
```

## Features Overview

### Authentication

- **Login**: Email/password authentication
- **Register**: Create new account
- **Auto-login**: Persistent sessions using secure token storage

### Wallet Management

- **View Cards**: Browse all cards in your wallet
- **Add Cards**: Discover and add new cards
- **Card Details**: View card information and check-in history
- **Remove Cards**: Remove cards from wallet (future feature)

### Check-in System

- **One-tap Check-in**: Record visits with a single tap
- **Points Earned**: Earn points with each check-in
- **Real-time Updates**: See updated points immediately

### Profile & Analytics

- **User Profile**: View account information
- **Points Summary**: Total points and check-in count
- **Activity Chart**: Bar chart showing check-ins over last 7 days
- **Check-in History**: Detailed list of all check-ins

## Building for Production

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle (for Google Play)
flutter build appbundle --release
```

The output will be in:
- APK: `build/app/outputs/flutter-apk/app-release.apk`
- Bundle: `build/app/outputs/bundle/release/app-release.aab`

### iOS

```bash
# Build iOS app
flutter build ios --release
```

Then open `ios/Runner.xcworkspace` in Xcode to archive and upload to App Store.

## Development Tips

### Hot Reload

While running `flutter run`, press:
- `r` for hot reload
- `R` for hot restart
- `q` to quit

### Debugging

```bash
# Run with debugging enabled
flutter run --debug

# View logs
flutter logs
```

### Common Issues

#### Connection Refused

If you get connection errors:
1. Check backend server is running
2. Verify the API base URL is correct
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. For iOS simulator, `localhost` should work
5. For physical devices, use your computer's IP address

#### Token Errors

If you get authentication errors:
1. Try logging out and back in
2. Clear app data
3. Check backend JWT_SECRET hasn't changed

## Future Enhancements

### Planned Features

1. **NFC/QR Code Scanning**
   - Scan physical cards to add to wallet
   - QR code check-in at locations
   - Implementation location: `card_detail_screen.dart`

2. **Push Notifications**
   - Notify users of new rewards
   - Remind users to check in
   - Alert for special promotions

3. **Geolocation**
   - Verify check-ins at physical locations
   - Location-based card discovery
   - Nearby businesses with cards

4. **Apple/Google Wallet Integration**
   - Generate wallet passes
   - Add cards to native wallets
   - Background updates

5. **Offline Mode**
   - Cache cards locally
   - Queue check-ins when offline
   - Sync when connection restored

6. **Social Features**
   - Share achievements
   - Friend leaderboards
   - Referral system

7. **Advanced Gamification**
   - Streaks and achievements
   - Badges for milestones
   - Tier-based rewards

8. **Biometric Authentication**
   - Face ID / Touch ID
   - Fingerprint login
   - Secure check-in verification

### Code Extension Points

#### Adding New Screens

1. Create screen file in `lib/screens/`
2. Add route navigation from existing screen
3. Update state provider if needed

#### Adding New API Endpoints

1. Add method to `ApiService` class
2. Define response model in `models/`
3. Call from UI screen or provider

#### Customizing Theme

Edit theme in `lib/main.dart`:

```dart
ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
  // Add your customizations
)
```

## Testing

### Unit Tests

```bash
flutter test
```

### Integration Tests

```bash
flutter drive --target=test_driver/app.dart
```

## Performance Optimization

- Images are loaded on-demand
- Cards use efficient list rendering
- API calls are debounced
- State updates are optimized

## Accessibility

The app follows Flutter accessibility guidelines:
- Semantic labels on interactive elements
- Screen reader support
- High contrast support

## Contributing

When adding new features:
1. Follow existing code structure
2. Add comments for complex logic
3. Update this README
4. Test on both iOS and Android

## License

MIT
