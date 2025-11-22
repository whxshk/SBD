import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

/// Authentication state provider
///
/// Manages user authentication state, login, register, and logout.
/// Uses Provider package for state management.
class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  /// Register a new user
  Future<bool> register({
    required String email,
    required String password,
    required String name,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final user = await _apiService.register(
        email: email,
        password: password,
        name: name,
      );
      _user = user;
      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Login with email and password
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final user = await _apiService.login(
        email: email,
        password: password,
      );
      _user = user;
      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      _setLoading(false);
      return false;
    }
  }

  /// Load current user from token
  Future<void> loadUser() async {
    final token = await _apiService.getToken();
    if (token == null) return;

    try {
      final user = await _apiService.getCurrentUser();
      _user = user;
      notifyListeners();
    } catch (e) {
      // Token might be invalid, clear it
      await _apiService.deleteToken();
      _user = null;
      notifyListeners();
    }
  }

  /// Logout
  Future<void> logout() async {
    await _apiService.logout();
    _user = null;
    notifyListeners();
  }

  /// Update user points (after check-in)
  void updatePoints(int newPoints) {
    if (_user != null) {
      _user = _user!.copyWith(points: newPoints);
      notifyListeners();
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _error = message;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }
}
