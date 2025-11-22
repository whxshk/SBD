import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/card.dart';
import '../models/checkin.dart';

/// API service for communicating with the SharkBand backend
///
/// Handles authentication, card management, check-ins, and data fetching.
/// Stores JWT token securely using FlutterSecureStorage.
class ApiService {
  // Change this to your backend URL
  // For local development: 'http://localhost:3000/api'
  // For Android emulator: 'http://10.0.2.2:3000/api'
  // For iOS simulator: 'http://localhost:3000/api'
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  final _storage = const FlutterSecureStorage();
  static const String _tokenKey = 'jwt_token';

  // ============================================================================
  // Token Management
  // ============================================================================

  Future<void> saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: _tokenKey);
  }

  Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      final token = await getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  /// Register a new user account
  Future<User> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: await _getHeaders(includeAuth: false),
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await saveToken(data['token']);
      return User.fromJson(data['user']);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Registration failed');
    }
  }

  /// Login with email and password
  Future<User> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: await _getHeaders(includeAuth: false),
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveToken(data['token']);
      return User.fromJson(data['user']);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Login failed');
    }
  }

  /// Get current user profile
  Future<User> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return User.fromJson(data);
    } else {
      throw Exception('Failed to get user profile');
    }
  }

  /// Logout (clear token)
  Future<void> logout() async {
    await deleteToken();
  }

  // ============================================================================
  // Cards
  // ============================================================================

  /// Get all available cards
  Future<List<CardModel>> getAllCards() async {
    final response = await http.get(
      Uri.parse('$baseUrl/cards'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => CardModel.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch cards');
    }
  }

  /// Get user's wallet cards
  Future<List<UserCard>> getMyCards() async {
    final response = await http.get(
      Uri.parse('$baseUrl/cards/my/wallet'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => UserCard.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch wallet cards');
    }
  }

  /// Add card to user's wallet
  Future<UserCard> addCardToWallet(String cardId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/cards/$cardId/add'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return UserCard.fromJson(data);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to add card');
    }
  }

  /// Remove card from user's wallet
  Future<void> removeCardFromWallet(String cardId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/cards/$cardId/remove'),
      headers: await _getHeaders(),
    );

    if (response.statusCode != 200) {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Failed to remove card');
    }
  }

  // ============================================================================
  // Check-ins
  // ============================================================================

  /// Record a check-in
  Future<CheckInResponse> checkIn({
    required String cardId,
    String? location,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/checkins'),
      headers: await _getHeaders(),
      body: jsonEncode({
        'cardId': cardId,
        if (location != null) 'location': location,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      return CheckInResponse.fromJson(data);
    } else {
      final error = jsonDecode(response.body);
      throw Exception(error['error'] ?? 'Check-in failed');
    }
  }

  /// Get user's check-in history
  Future<List<CheckIn>> getMyCheckIns({int limit = 50, int offset = 0}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/checkins/my?limit=$limit&offset=$offset'),
      headers: await _getHeaders(),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> checkInsData = data['data'];
      return checkInsData.map((json) => CheckIn.fromJson(json)).toList();
    } else {
      throw Exception('Failed to fetch check-ins');
    }
  }
}
