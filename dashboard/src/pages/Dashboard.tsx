/**
 * Analytics dashboard page
 * Shows business metrics and charts
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiService } from '../services/api';
import { AnalyticsResponse } from '../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAnalyticsOverview();
      setAnalytics(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="dashboard-page">
        <div className="error-message">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <button className="btn-secondary" onClick={loadAnalytics}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon="👥"
          label="Total Users"
          value={analytics.totalUsers}
          color="#667eea"
        />
        <StatCard
          icon="📇"
          label="Total Cards"
          value={analytics.totalCards}
          color="#f093fb"
        />
        <StatCard
          icon="✅"
          label="Total Check-ins"
          value={analytics.totalCheckIns}
          color="#4facfe"
        />
        <StatCard
          icon="🔥"
          label="Active Users"
          value={analytics.activeUsers}
          color="#43e97b"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Daily Check-ins Chart */}
        <div className="chart-card">
          <h2>Daily Check-ins (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyCheckIns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#667eea"
                strokeWidth={2}
                name="Check-ins"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Card Performance Chart */}
        <div className="chart-card">
          <h2>Card Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.cardStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cardName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCheckIns" fill="#667eea" name="Check-ins" />
              <Bar dataKey="uniqueUsers" fill="#f093fb" name="Unique Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2>🏆 Top Users Leaderboard</h2>
        {analytics.topUsers.length === 0 ? (
          <div className="empty-state">
            <p>No user activity yet</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>
                      <span className={`rank rank-${user.rank}`}>
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                      </span>
                    </td>
                    <td className="user-name">{user.userName}</td>
                    <td className="user-email">{user.userEmail}</td>
                    <td className="user-points">
                      <span className="points-badge">{user.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Card Stats Table */}
      <div className="card-stats-section">
        <h2>Card Statistics</h2>
        {analytics.cardStats.length === 0 ? (
          <div className="empty-state">
            <p>No cards available</p>
          </div>
        ) : (
          <div className="stats-table">
            <table>
              <thead>
                <tr>
                  <th>Card Name</th>
                  <th>Total Check-ins</th>
                  <th>Unique Users</th>
                  <th>Avg per User</th>
                </tr>
              </thead>
              <tbody>
                {analytics.cardStats.map((stat) => {
                  const avgPerUser = stat.uniqueUsers > 0
                    ? (stat.totalCheckIns / stat.uniqueUsers).toFixed(1)
                    : '0';

                  return (
                    <tr key={stat.cardId}>
                      <td className="card-name">{stat.cardName}</td>
                      <td>{stat.totalCheckIns}</td>
                      <td>{stat.uniqueUsers}</td>
                      <td>{avgPerUser}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value.toLocaleString()}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};
