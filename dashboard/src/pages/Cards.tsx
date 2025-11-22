/**
 * Card management page
 * Allows admins/businesses to view, create, edit, and delete cards
 */

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Card } from '../types';
import './Cards.css';

export const Cards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getAllCards();
      setCards(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      await apiService.deleteCard(id);
      await loadCards();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete card');
    }
  };

  const handleToggleActive = async (card: Card) => {
    try {
      await apiService.updateCard(card.id, { isActive: !card.isActive });
      await loadCards();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update card');
    }
  };

  return (
    <div className="cards-page">
      <div className="page-header">
        <h1>Card Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Card
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading cards...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : cards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📇</div>
          <h2>No cards yet</h2>
          <p>Create your first card to get started</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Card
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadCards}
        />
      )}
    </div>
  );
};

interface CardItemProps {
  card: Card;
  onDelete: (id: string) => void;
  onToggleActive: (card: Card) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onDelete, onToggleActive }) => {
  const cardColor = card.backgroundColor || '#4ECDC4';

  return (
    <div className="card-item">
      <div
        className="card-preview"
        style={{
          background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)`,
        }}
      >
        <div className="card-logo">{card.logo || '🎫'}</div>
        <div className="card-info">
          <h3>{card.name}</h3>
          {card.description && <p>{card.description}</p>}
        </div>
      </div>

      <div className="card-details">
        <div className="card-meta">
          <span className={`status ${card.isActive ? 'active' : 'inactive'}`}>
            {card.isActive ? '✓ Active' : '✕ Inactive'}
          </span>
          <span className="card-id">ID: {card.id.slice(0, 8)}...</span>
        </div>

        <div className="card-actions">
          <button
            className="btn-secondary"
            onClick={() => onToggleActive(card)}
          >
            {card.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            className="btn-danger"
            onClick={() => onDelete(card.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

interface CreateCardModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#4ECDC4');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiService.createCard({
        name,
        description,
        logo,
        backgroundColor,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create card');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Card</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Card Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Coffee Loyalty Card"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the card"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Logo (emoji or text)</label>
            <input
              type="text"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              placeholder="☕"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Background Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#4ECDC4"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
