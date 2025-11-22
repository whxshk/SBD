/**
 * API service for SharkBand Dashboard
 *
 * Handles all HTTP requests to the backend API
 */

import axios, { AxiosInstance } from 'axios';
import {
  AuthResponse,
  Card,
  AnalyticsResponse,
  CardAnalytics,
} from '../types';

// Configure base URL - change this to match your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to attach token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    this.saveToken(response.data.token);
    return response.data;
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: string = 'admin'
  ): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      role,
    });
    this.saveToken(response.data.token);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // ============================================================================
  // Cards
  // ============================================================================

  async getAllCards(): Promise<Card[]> {
    const response = await this.client.get<Card[]>('/cards');
    return response.data;
  }

  async getCard(id: string): Promise<Card> {
    const response = await this.client.get<Card>(`/cards/${id}`);
    return response.data;
  }

  async createCard(data: {
    name: string;
    description?: string;
    logo?: string;
    backgroundColor?: string;
    metadata?: Record<string, any>;
  }): Promise<Card> {
    const response = await this.client.post<Card>('/cards', data);
    return response.data;
  }

  async updateCard(
    id: string,
    data: {
      name?: string;
      description?: string;
      logo?: string;
      backgroundColor?: string;
      isActive?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<Card> {
    const response = await this.client.put<Card>(`/cards/${id}`, data);
    return response.data;
  }

  async deleteCard(id: string): Promise<void> {
    await this.client.delete(`/cards/${id}`);
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  async getAnalyticsOverview(): Promise<AnalyticsResponse> {
    const response = await this.client.get<AnalyticsResponse>(
      '/analytics/overview'
    );
    return response.data;
  }

  async getCardAnalytics(): Promise<CardAnalytics[]> {
    const response = await this.client.get<CardAnalytics[]>('/analytics/cards');
    return response.data;
  }

  async getDailyAnalytics(days: number = 30) {
    const response = await this.client.get(`/analytics/daily?days=${days}`);
    return response.data;
  }

  async getLeaderboard(limit: number = 10) {
    const response = await this.client.get(`/analytics/leaderboard?limit=${limit}`);
    return response.data;
  }

  async getUserActivity() {
    const response = await this.client.get('/analytics/user-activity');
    return response.data;
  }
}

export const apiService = new ApiService();
