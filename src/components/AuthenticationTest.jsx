import React, { useState, useEffect } from 'react';
import SteamAuth from './SteamAuth';
import DiscordAuth from './DiscordAuth';
import './AuthenticationTest.css';

function AuthenticationTest() {
  const [steamUser, setSteamUser] = useState(null);
  const [discordUser, setDiscordUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Check for saved authentication data
  useEffect(() => {
    const savedSteamUser = localStorage.getItem('steamUser');
    const savedDiscordUser = localStorage.getItem('discordUser');
    
    if (savedSteamUser) {
      setSteamUser(JSON.parse(savedSteamUser));
    }
    
    if (savedDiscordUser) {
      setDiscordUser(JSON.parse(savedDiscordUser));
    }
  }, []);

  // Monitor authentication changes
  useEffect(() => {
    const checkAuth = () => {
      const steamData = localStorage.getItem('steamUser');
      const discordData = localStorage.getItem('discordUser');
      
      setSteamUser(steamData ? JSON.parse(steamData) : null);
      setDiscordUser(discordData ? JSON.parse(discordData) : null);
    };

    // Check every second for authentication changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update connection status based on authentication state
  useEffect(() => {
    if (steamUser && discordUser) {
      setConnectionStatus('fully-connected');
    } else if (steamUser || discordUser) {
      setConnectionStatus('partially-connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [steamUser, discordUser]);

  const simulateIsleConnection = () => {
    if (!steamUser || !discordUser) {
      alert('❌ Please authenticate with both Steam and Discord before connecting to The Isle server!');
      return;
    }

    // Simulate connecting to The Isle server
    alert(`🎮 Connecting to The Isle server...\n\n` +
          `Steam: ${steamUser.personaname}\n` +
          `Discord: ${discordUser.username}#${discordUser.discriminator}\n\n` +
          `✅ Authentication verified! You can now join the server.`);
  };

  const clearAllAuth = () => {
    localStorage.removeItem('steamUser');
    localStorage.removeItem('discordUser');
    setSteamUser(null);
    setDiscordUser(null);
    setConnectionStatus('disconnected');
  };

  return (
    <div className="authentication-test">
      <div className="auth-header">
        <h2>🔐 Authentication Testing Center</h2>
        <p>Test both Steam and Discord authentication systems before connecting to The Isle server</p>
        
        <div className={`connection-status ${connectionStatus}`}>
          <div className="status-indicator"></div>
          <span className="status-text">
            {connectionStatus === 'disconnected' && '❌ Not Connected'}
            {connectionStatus === 'partially-connected' && '⚠️ Partially Connected'}
            {connectionStatus === 'fully-connected' && '✅ Fully Connected'}
          </span>
        </div>
      </div>

      <div className="auth-grid">
        <div className="auth-section steam-section">
          <div className="section-header">
            <h3>🎮 Steam Authentication</h3>
            <div className={`auth-indicator ${steamUser ? 'connected' : 'disconnected'}`}>
              {steamUser ? '✅ Connected' : '❌ Disconnected'}
            </div>
          </div>
          <SteamAuth />
        </div>

        <div className="auth-section discord-section">
          <div className="section-header">
            <h3>💬 Discord Authentication</h3>
            <div className={`auth-indicator ${discordUser ? 'connected' : 'disconnected'}`}>
              {discordUser ? '✅ Connected' : '❌ Disconnected'}
            </div>
          </div>
          <DiscordAuth />
        </div>
      </div>

      <div className="auth-controls">
        <div className="isle-connection">
          <h3>🦖 The Isle Server Connection</h3>
          <p>
            Once both Steam and Discord are authenticated, you can connect to The Isle server.
            This ensures proper identity verification and access to server features.
          </p>
          
          <button 
            onClick={simulateIsleConnection}
            className={`isle-connect-btn ${connectionStatus === 'fully-connected' ? 'ready' : 'disabled'}`}
            disabled={connectionStatus !== 'fully-connected'}
          >
            {connectionStatus === 'fully-connected' 
              ? '🚀 Connect to The Isle Server' 
              : '🔒 Authenticate First'
            }
          </button>
        </div>

        <div className="auth-management">
          <h4>🛠️ Authentication Management</h4>
          <div className="management-controls">
            <button onClick={clearAllAuth} className="clear-auth-btn">
              🗑️ Clear All Authentication
            </button>
            
            <div className="auth-summary">
              <div className="summary-item">
                <strong>Steam Status:</strong> 
                <span className={steamUser ? 'connected' : 'disconnected'}>
                  {steamUser ? `Connected as ${steamUser.personaname}` : 'Not Connected'}
                </span>
              </div>
              
              <div className="summary-item">
                <strong>Discord Status:</strong> 
                <span className={discordUser ? 'connected' : 'disconnected'}>
                  {discordUser ? `Connected as ${discordUser.username}#${discordUser.discriminator}` : 'Not Connected'}
                </span>
              </div>
              
              <div className="summary-item">
                <strong>Server Ready:</strong> 
                <span className={connectionStatus === 'fully-connected' ? 'ready' : 'not-ready'}>
                  {connectionStatus === 'fully-connected' ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="testing-info">
        <h4>📋 Testing Information</h4>
        <div className="info-grid">
          <div className="info-section">
            <h5>🧪 Demo Mode Features</h5>
            <ul>
              <li>Test authentication without real accounts</li>
              <li>Simulate user data and permissions</li>
              <li>Practice server connection flow</li>
              <li>Validate UI and user experience</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h5>🔑 Real Authentication</h5>
            <ul>
              <li>Steam OpenID authentication</li>
              <li>Discord OAuth integration</li>
              <li>Secure token handling</li>
              <li>Production-ready implementation</li>
            </ul>
          </div>
          
          <div className="info-section">
            <h5>🦖 The Isle Integration</h5>
            <ul>
              <li>Verify player identity</li>
              <li>Link Steam profiles to game accounts</li>
              <li>Discord role-based permissions</li>
              <li>Community server access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthenticationTest;