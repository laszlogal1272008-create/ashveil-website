import React, { useState } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import MutationSelector from './MutationSelector';
import SocialPanel from './SocialPanel';
import GameManager from './GameManager';
import './Profile.css';

function Profile() {
  const [showMutationSelector, setShowMutationSelector] = useState(false);
  const [currentDino, setCurrentDino] = useState(null);
  const { currencies } = useCurrency();

  const mockUser = {
    username: "AshveilWarrior",
    steamId: "76561198123456789",
    level: 42,
    playtime: "245 hours",
    joinDate: "March 2024",
    avatar: null
  };

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
    setShowMutationSelector(true);
  };

  const handleRedeemWithMutations = (selectedMutations, presetName) => {
    console.log('Redeeming with mutations:', selectedMutations, presetName);
    setShowMutationSelector(false);
    // This would integrate with game server
    alert(`Redeemed ${currentDino?.name || 'dinosaur'} with ${selectedMutations.length} mutations!`);
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="user-info">
          <div className="avatar-section">
            <div className="user-avatar">
              <span>{mockUser.username.charAt(0)}</span>
            </div>
            <div className="user-details">
              <h1>{mockUser.username}</h1>
              <p className="steam-id">Steam ID: {mockUser.steamId}</p>
              <div className="user-stats">
                <span>Level {mockUser.level}</span>
                <span>{mockUser.playtime}</span>
                <span>Joined {mockUser.joinDate}</span>
              </div>
            </div>
          </div>
          
          <div className="currency-overview">
            <div className="currency-item">
              <span className="amount">{currencies['Void Pearls'].toLocaleString()}</span>
              <span className="label">Void Pearls</span>
            </div>
            <div className="currency-item">
              <span className="amount">{currencies['Razor Talons'].toLocaleString()}</span>
              <span className="label">Razor Talons</span>
            </div>
            <div className="currency-item">
              <span className="amount">{currencies['Sylvan Shards'].toLocaleString()}</span>
              <span className="label">Sylvan Shards</span>
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

      {showMutationSelector && (
        <MutationSelector
          selectedDinosaur={currentDino}
          onRedeem={handleRedeemWithMutations}
          onClose={() => setShowMutationSelector(false)}
        />
      )}
    </div>
  );
}

export default Profile;
