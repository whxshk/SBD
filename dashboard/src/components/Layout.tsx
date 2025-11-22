/**
 * Layout component with navigation
 */

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './Layout.css';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Admin');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setUserName(user.name);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      apiService.logout();
      navigate('/login');
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">🦈</div>
          <h1>SharkBand</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/cards" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">📇</span>
            <span>Cards</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userName[0]?.toUpperCase() || 'A'}</div>
            <div className="user-details">
              <div className="user-name">{userName}</div>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
