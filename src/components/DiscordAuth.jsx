import React, { useState, useEffect } from 'react';
import './DiscordAuth.css';

function DiscordAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // OAuth is now handled by backend

  // Real Discord OAuth authentication via backend
  const discordLogin = () => {
    setIsLoading(true);
    // Redirect to backend Discord OAuth (now on Netlify Functions)
    window.location.href = '/auth/discord';
  };

  // Mock Discord user data for demonstration
  const mockDiscordLogin = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockUser = {
        discordId: '123456789012345678',
        username: 'AshveilSurvivor',
        discriminator: '1337',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
        serverNickname: 'Alpha Rex Hunter',
        roles: ['Patreon Supporter', 'Veteran Player', 'Event Winner'],
        joinDate: 'March 2024',
        serverBoosts: 2,
        isOnline: true,
        authenticationType: 'demo'
      };
      
      setUser(mockUser);
      setIsLoading(false);
      localStorage.setItem('discordUser', JSON.stringify(mockUser));
    }, 1500);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('discordUser');
  };

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('discordUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle Discord OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !user) {
      // In a real implementation, you'd send this code to your backend
      // to exchange for an access token and get user info
      console.log('Discord OAuth code received:', code);
      mockDiscordLogin(); // For demo purposes
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="discord-auth">
        <div className="discord-loading">
          <div className="loading-spinner discord-spinner"></div>
          <p>🎮 Connecting to Discord...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="discord-auth">
        <div className="discord-user-info">
          <div className="user-avatar discord-avatar">
            <img src={user.avatar} alt={user.username} />
            <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`}></div>
          </div>
          
          <div className="user-details discord-details">
            <h3>🎭 Welcome, {user.serverNickname || user.username}!</h3>
            {user.authenticationType === 'demo' && (
              <div className="demo-badge discord-demo">
                🧪 Demo Mode - Test Authentication
              </div>
            )}
            <div className="discord-tag">
              <strong>Discord:</strong> 
              <span className="discord-username">{user.username}#{user.discriminator}</span>
            </div>
            
            <div className="server-info">
              <div className="join-date">
                <strong>Joined Server:</strong> {user.joinDate}
              </div>
              {user.serverBoosts > 0 && (
                <div className="server-boosts">
                  <strong>Server Boosts:</strong> 
                  <span className="boost-count">💎 {user.serverBoosts}</span>
                </div>
              )}
            </div>
            
            <div className="user-roles">
              <strong>Roles:</strong>
              <div className="roles-list">
                {user.roles.map((role, index) => (
                  <span key={index} className="role-badge">{role}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <button onClick={logout} className="btn btn-secondary logout-btn discord-logout">
          Leave Discord
        </button>
      </div>
    );
  }

  return (
    <div className="discord-auth">
      <div className="discord-login">
        <h3>💬 Join Our Discord Community</h3>
        <p>Connect with the Ashveil community, get support, and access exclusive Discord features</p>
        
        <div className="auth-options">
          <button onClick={discordLogin} className="discord-login-btn real-auth">
            <div className="discord-btn-content">
              <svg className="discord-logo" viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Login with Discord</span>
            </div>
            <small>Real Discord Authentication</small>
          </button>
          
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          <button onClick={discordLogin} className="discord-login-btn">
            <div className="demo-discord-btn">
              <span>🧪 Demo Discord Login</span>
              <small>Test without real Discord account</small>
            </div>
          </button>
        </div>
        
        <div className="discord-benefits">
          <h4>💬 Discord Community Benefits:</h4>
          <ul>
            <li>✅ Real-time server announcements and updates</li>
            <li>✅ Direct support from admins and moderators</li>
            <li>✅ Access exclusive Discord channels</li>
            <li>✅ Community events and challenges</li>
            <li>✅ Role-based server permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DiscordAuth;