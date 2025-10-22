import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DinosaurManager.css';

const DinosaurManager = () => {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const { user, isAuthenticated, getSteamId } = useAuth();

  const handleSlayDinosaur = async () => {
    if (!isAuthenticated) {
      setMessage('Please log in to use this feature.');
      setMessageType('error');
      return;
    }

    if (!playerName.trim()) {
      setMessage('Please enter your in-game character name.');
      setMessageType('error');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to slay your dinosaur?\n\n` +
      `Character: ${playerName}\n` +
      `This action cannot be undone and will:\n` +
      `• Kill your current dinosaur immediately\n` +
      `• Reset your growth progress\n` +
      `• Allow you to respawn as a juvenile\n\n` +
      `Proceed with slaying your dinosaur?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/dinosaur/slay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          playerName: playerName.trim(),
          steamId: getSteamId()
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(`💀 Successfully slayed ${playerName}'s dinosaur! You can now respawn as a juvenile.`);
        setMessageType('success');
        
        // Clear the player name after successful slay
        setTimeout(() => {
          setPlayerName('');
        }, 2000);
      } else {
        setMessage(result.error || 'Failed to slay dinosaur. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Slay request failed:', error);
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dinosaur-manager">
        <div className="not-authenticated">
          <h3>🔒 Authentication Required</h3>
          <p>Please log in with Steam to access dinosaur management features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dinosaur-manager">
      <div className="manager-header">
        <h3>🦕 Dinosaur Management</h3>
        <p>Manage your current dinosaur while in-game</p>
      </div>

      <div className="slay-section">
        <h4>💀 Slay Current Dinosaur</h4>
        <p className="slay-description">
          Use this feature to instantly kill your current dinosaur if you're stuck, 
          want to restart growth, or need to switch species quickly.
        </p>

        <div className="slay-form">
          <div className="form-group">
            <label htmlFor="playerName">In-Game Character Name:</label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your exact character name"
              disabled={loading}
              className="player-name-input"
            />
            <small className="input-hint">
              Enter your exact character name as it appears in-game (case sensitive)
            </small>
          </div>

          <button
            onClick={handleSlayDinosaur}
            disabled={loading || !playerName.trim()}
            className={`slay-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Slaying Dinosaur...
              </>
            ) : (
              <>
                💀 Slay My Dinosaur
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="slay-warnings">
          <h5>⚠️ Important Notes:</h5>
          <ul>
            <li>This action is <strong>irreversible</strong></li>
            <li>You must be currently online in the server</li>
            <li>Your character name must match exactly</li>
            <li>All growth progress will be lost</li>
            <li>You'll respawn as a juvenile dinosaur</li>
            <li>This feature works for any species you're currently playing</li>
          </ul>
        </div>
      </div>

      <div className="user-info">
        <h5>👤 Current Session</h5>
        <p><strong>Steam User:</strong> {user?.displayName || 'Unknown'}</p>
        <p><strong>Steam ID:</strong> {getSteamId() || 'Not available'}</p>
      </div>
    </div>
  );
};

export default DinosaurManager;