import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SteamAuth from './SteamAuth';
import DiscordAuth from './DiscordAuth';

function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  console.log('🏠 Home: Auth state:', { user, isAuthenticated, isLoading });
  return (
    <div className="profile">
      <h1>Welcome to Ashveil</h1>
      <p>This is your home page. Use the navigation above to explore your profile, inventory, shop, and more!</p>
      <p style={{color: 'var(--ashveil-ember)', fontSize: '0.9rem', textAlign: 'center'}}>
        🌋 Enter the Veil — Survive, Hunt, Evolve 🦖
      </p>
      
      {/* Authentication Sections */}
      <div className="auth-sections">
        {isLoading ? (
          <div style={{textAlign: 'center', padding: '20px'}}>
            <p>⏳ Checking authentication...</p>
          </div>
        ) : isAuthenticated ? (
          <div className="authenticated-welcome">
            <div style={{
              background: 'linear-gradient(145deg, var(--ashveil-charcoal), #1a1a1a)',
              border: '2px solid var(--ashveil-ember)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              margin: '20px 0'
            }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px'}}>
                {user.avatar && (
                  <img 
                    src={user.avatar} 
                    alt="Profile" 
                    style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--ashveil-ember)'}}
                  />
                )}
                <div>
                  <h3 style={{color: 'var(--ashveil-ember)', margin: '0'}}>
                    Welcome back, {user.displayName || user.username}!
                  </h3>
                  <p style={{color: 'var(--ashveil-ash)', margin: '4px 0', fontSize: '0.9rem'}}>
                    {user.provider === 'steam' ? '🎮 Steam Account' : '💬 Discord Account'} Connected
                  </p>
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                <a href="/profile" style={{
                  background: 'transparent',
                  color: 'var(--ashveil-ember)',
                  border: '1px solid var(--ashveil-ember)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}>
                  👤 View Profile
                </a>
                <a href="/games" style={{
                  background: 'transparent',
                  color: 'var(--ashveil-ember)',
                  border: '1px solid var(--ashveil-ember)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}>
                  🎮 Game Features
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <SteamAuth />
            <DiscordAuth />
          </>
        )}
      </div>
      
      <div style={{marginTop: '32px', textAlign: 'center'}}>
        <h3 style={{color: 'var(--ashveil-ember)'}}>🦕 Ashveil Server Features</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '20px'}}>
          <div className="feature-card">
            <h4>🎮 Game Integration</h4>
            <p>Connect your Steam account to manage your Isle dinosaurs</p>
          </div>
          <div className="feature-card">
            <h4>💬 Discord Community</h4>
            <p>Join our Discord server for real-time chat, events, and community support</p>
          </div>
          <div className="feature-card">
            <h4>🛒 Shop & Market</h4>
            <p>Buy dinosaurs from the official shop with Void Pearls, or trade with players on the market</p>
          </div>
          <div className="feature-card">
            <h4>💎 Currency System</h4>
            <p>Shop uses Void Pearls (premium). Market uses Razor Talons (carnivore trades) and Sylvan Shards (herbivore trades)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
