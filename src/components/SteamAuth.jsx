import React, { useState, useEffect } from 'react';
import './SteamAuth.css';

function SteamAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock Steam user data for demonstration
  const mockSteamLogin = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockUser = {
        steamId: '76561198123456789',
        displayName: 'AshveilSurvivor',
        avatar: 'https://avatars.steamstatic.com/b5bd56c1aa4644a474a2e4972be27ef9e82e517e_medium.jpg',
        profileUrl: 'https://steamcommunity.com/id/ashveilsurvivor',
        currentDino: 'Carnotaurus',
        level: 3.2,
        playTime: '142 hours'
      };
      
      setUser(mockUser);
      setIsLoading(false);
      localStorage.setItem('steamUser', JSON.stringify(mockUser));
    }, 1500);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('steamUser');
  };

  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('steamUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (isLoading) {
    return (
      <div className="steam-auth">
        <div className="steam-loading">
          <div className="loading-spinner"></div>
          <p>🎮 Connecting to Steam...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="steam-auth">
        <div className="steam-user-info">
          <div className="user-avatar">
            <img src={user.avatar} alt={user.displayName} />
            <div className="online-indicator"></div>
          </div>
          
          <div className="user-details">
            <h3>🎮 Welcome back, {user.displayName}!</h3>
            <div className="steam-id">
              <strong>Steam ID:</strong> 
              <span className="steam-id-value">{user.steamId}</span>
            </div>
            
            <div className="current-dino">
              <strong>Current Dinosaur:</strong> 
              <span className="dino-name">{user.currentDino}</span>
              <span className="dino-level">Level {user.level}</span>
            </div>
            
            <div className="play-stats">
              <span className="play-time">⏱️ {user.playTime}</span>
            </div>
          </div>
        </div>
        
        <button onClick={logout} className="btn btn-secondary logout-btn">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="steam-auth">
      <div className="steam-login">
        <h3>🎮 Connect Your Steam Account</h3>
        <p>Link your Steam account to access your Isle dinosaurs and progress</p>
        
        <button onClick={mockSteamLogin} className="steam-login-btn">
          <img src="https://community.cloudflare.steamstatic.com/public/images/signinthroughsteam/sits_01.png" 
               alt="Sign in through Steam" />
        </button>
        
        <div className="steam-benefits">
          <h4>🦖 Benefits of connecting Steam:</h4>
          <ul>
            <li>✅ View your current dinosaur and progress</li>
            <li>✅ Access your dinosaur inventory</li>
            <li>✅ Park or slay your current dino</li>
            <li>✅ Trade dinosaurs with other players</li>
            <li>✅ Teleport to friends (with permissions)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SteamAuth;