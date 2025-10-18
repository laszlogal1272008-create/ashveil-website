import React from 'react';
import SteamAuth from './SteamAuth';
import DiscordAuth from './DiscordAuth';

function Home() {
  return (
    <div className="profile">
      <h1>Welcome to Ashveil</h1>
      <p>This is your home page. Use the navigation above to explore your profile, inventory, shop, and more!</p>
      <p style={{color: 'var(--ashveil-ember)', fontSize: '0.9rem', textAlign: 'center'}}>
        🌋 Enter the Veil — Survive, Hunt, Evolve 🦖
      </p>
      
      {/* Authentication Sections */}
      <div className="auth-sections">
        <SteamAuth />
        <DiscordAuth />
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
