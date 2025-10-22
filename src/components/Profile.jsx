import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import SocialPanel from './SocialPanel';
import GameManager from './GameManager';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [currentDino, setCurrentDino] = useState(null);
  const { currencies } = useCurrency();
  const { user, isAuthenticated, isLoading, switchAccount, logout } = useAuth();

  // Component to switch between available accounts
  const AccountSwitcher = () => {
    const [availableAccounts, setAvailableAccounts] = useState([]);

    React.useEffect(() => {
      const steamUser = localStorage.getItem('steamUser');
      const discordUser = localStorage.getItem('discordUser');
      const accounts = [];

      if (steamUser) {
        const steam = JSON.parse(steamUser);
        accounts.push({ provider: 'steam', name: steam.displayName || steam.username, current: user?.provider === 'steam' });
      }
      if (discordUser) {
        const discord = JSON.parse(discordUser);
        accounts.push({ provider: 'discord', name: discord.displayName || discord.username, current: user?.provider === 'discord' });
      }

      setAvailableAccounts(accounts);
    }, [user]);

    if (availableAccounts.length <= 1) return null;

    return (
      <div style={{marginTop: '12px'}}>
        <p style={{fontSize: '0.8rem', color: 'var(--ashveil-ash)', marginBottom: '6px'}}>
          Switch Account:
        </p>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
          {availableAccounts.map(account => (
            <button
              key={account.provider}
              onClick={() => switchAccount(account.provider)}
              style={{
                background: account.current ? 'var(--ashveil-ember)' : 'transparent',
                color: account.current ? 'var(--ashveil-charcoal)' : 'var(--ashveil-ember)',
                border: '1px solid var(--ashveil-ember)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {account.provider === 'steam' ? '🎮' : '💬'} {account.name}
            </button>
          ))}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to logout from all accounts?')) {
                logout();
              }
            }}
            style={{
              background: 'transparent',
              color: 'var(--ashveil-red)',
              border: '1px solid var(--ashveil-red)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    );
  };

  // Component to show connection options for accounts not yet connected
  const AdditionalAccountLinks = () => {
    const [missingAccounts, setMissingAccounts] = useState([]);

    React.useEffect(() => {
      const steamUser = localStorage.getItem('steamUser');
      const discordUser = localStorage.getItem('discordUser');
      const missing = [];

      if (!steamUser) {
        missing.push({ provider: 'steam', label: '🎮 Connect Steam' });
      }
      if (!discordUser) {
        missing.push({ provider: 'discord', label: '💬 Connect Discord' });
      }

      setMissingAccounts(missing);
    }, [user]);

    if (missingAccounts.length === 0) return null;

    return (
      <div style={{marginTop: '12px'}}>
        <p style={{fontSize: '0.75rem', color: 'var(--ashveil-ash)', marginBottom: '6px'}}>
          Connect additional accounts:
        </p>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {missingAccounts.map(account => (
            <a 
              key={account.provider}
              href={`/auth/${account.provider}`} 
              style={{
                background: 'transparent',
                color: 'var(--ashveil-ember)',
                border: '1px solid var(--ashveil-ember)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {account.label}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // Debug logging
  console.log('Profile: Auth state:', { user, isAuthenticated, isLoading });

  // Default user data for when not authenticated
  const defaultUser = {
    username: "Guest",
    steamId: "Not logged in",
    level: 1,
    playtime: "0 hours",
    joinDate: "N/A",
    avatar: null
  };

  // Use real user data if authenticated, otherwise use default
  const displayUser = isAuthenticated && user ? (() => {
    if (user.provider === 'steam') {
      return {
        username: user.displayName || user.username || "Steam User",
        realName: user.realName || null,
        userId: user.steamId || user.steam_id || "Unknown",
        userIdLabel: "Steam ID",
        level: 42, // This would come from game server data
        playtime: "245 hours", // This would come from Steam API or game server
        joinDate: user.accountCreated ? `Steam since ${user.accountCreated}` : "March 2024",
        avatar: user.avatar || null,
        profileUrl: user.profileUrl || null,
        country: user.country || null,
        provider: 'steam',
        verified: null
      };
    } else if (user.provider === 'discord') {
      return {
        username: user.displayName || user.fullUsername || user.username || "Discord User",
        realName: user.fullUsername !== user.displayName ? user.fullUsername : null,
        userId: user.discordId || "Unknown",
        userIdLabel: "Discord ID",
        level: 42, // This would come from game server data
        playtime: "245 hours", // This would come from game server or Discord activity
        joinDate: "Discord member since 2024", // Could get actual join date from Discord API
        avatar: user.avatar || null,
        profileUrl: null, // Discord doesn't have public profile URLs like Steam
        country: null,
        provider: 'discord',
        verified: user.verified || false,
        premium: user.premium_type > 0,
        locale: user.locale
      };
    }
    return defaultUser;
  })() : defaultUser;

  const mockGameState = {
    isInGame: true,
    currentDinosaur: {
      name: "Allosaurus",
      health: 85,
      hunger: 60,
      thirst: 40,
      location: "Great Falls"
    },
    isAlive: true
  };

  const handleRedeem = () => {
    // Navigate to dedicated redeem page
    navigate('/redeem', { 
      state: { 
        selectedDinosaur: currentDino || { name: 'Triceratops', level: 3, mutations: ['Osteosclerosis'] }
      } 
    });
  };

  const handleRedeemWithMutations = (selectedMutations, presetName) => {
    console.log('Redeeming with mutations:', selectedMutations, presetName);
    // This would integrate with game server
    alert(`Redeemed ${currentDino?.name || 'dinosaur'} with ${selectedMutations.length} mutations!`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="profile">
        <div className="profile-header">
          <div className="user-info">
            <div className="avatar-section">
              <div className="user-avatar">
                <span>⏳</span>
              </div>
              <div className="user-details">
                <h1>Loading...</h1>
                <p className="steam-id">Checking authentication...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="user-info">
          <div className="avatar-section">
            <div className="user-avatar">
              {displayUser.avatar ? (
                <img src={displayUser.avatar} alt="Steam Avatar" />
              ) : (
                <span>{displayUser.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-details">
              <h1>{displayUser.username}</h1>
              {displayUser.realName && (
                <p className="real-name">({displayUser.realName})</p>
              )}
              <p className="user-id">
                {displayUser.userIdLabel}: {displayUser.userId}
                {displayUser.country && <span className="country"> 🌍 {displayUser.country}</span>}
                {displayUser.verified && <span className="verified"> ✅ Verified</span>}
                {displayUser.premium && <span className="premium"> 👑 Nitro</span>}
              </p>
              {displayUser.profileUrl && (
                <p className="profile-link">
                  <a href={displayUser.profileUrl} target="_blank" rel="noopener noreferrer">
                    🔗 View {displayUser.provider === 'steam' ? 'Steam' : 'Discord'} Profile
                  </a>
                </p>
              )}
              {displayUser.provider === 'discord' && displayUser.locale && (
                <p className="user-locale">
                  🌐 Language: {displayUser.locale.toUpperCase()}
                </p>
              )}
              {!isAuthenticated ? (
                <div className="auth-prompt">
                  <p>Connect your gaming accounts to see your profile:</p>
                  <div className="auth-links">
                    <a href="/auth/steam">🎮 Login with Steam</a>
                    <a href="/auth/discord">💬 Login with Discord</a>
                  </div>
                </div>
              ) : (
                <div className="auth-status">
                  <p style={{fontSize: '0.85rem', color: 'var(--ashveil-ash)', marginTop: '8px'}}>
                    Connected via {displayUser.provider === 'steam' ? '🎮 Steam' : '💬 Discord'}
                  </p>
                  <AccountSwitcher />
                  <AdditionalAccountLinks />
                </div>
              )}
            </div>
            <div className="user-stats">
              <span>Level {displayUser.level}</span>
              <span>{displayUser.playtime}</span>
              <span>{displayUser.joinDate}</span>
            </div>
          </div>
          
          <div className="currency-overview">
            <div className="currency-item">
              <span className="amount">{currencies['Void Pearls'].toLocaleString()}</span>
              <span className="label">VOID PEARLS</span>
            </div>
            <div className="currency-item">
              <span className="amount">{currencies['Razor Talons'].toLocaleString()}</span>
              <span className="label">RAZOR TALONS</span>
            </div>
            <div className="currency-item">
              <span className="amount">{currencies['Sylvan Shards'].toLocaleString()}</span>
              <span className="label">SYLVAN SHARDS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="left-panel">
          <SocialPanel />
        </div>
        
        <div className="right-panel">
          <GameManager 
            gameState={mockGameState}
            onRedeem={handleRedeem}
            onSelectDino={setCurrentDino}
          />
        </div>
      </div>
    </div>
  );
}

export default Profile;
