import React from 'react';
import { useNavigate } from 'react-router-dom';
import './GameManager.css';

function GameManager({ gameState, onRedeem, onSelectDino }) {
  const navigate = useNavigate();

  const mockInventory = [
    { id: 1, name: 'Allosaurus', level: 5, mutations: ['Cellular Regeneration', 'Featherweight'] },
    { id: 2, name: 'Triceratops', level: 3, mutations: ['Osteosclerosis'] },
    { id: 3, name: 'Carnotaurus', level: 7, mutations: ['Nocturnal', 'Hydrodynamic', 'Epidermal Fibrosis'] },
    { id: 4, name: 'Dryosaurus', level: 2, mutations: [] },
    { id: 5, name: 'Stegosaurus', level: 4, mutations: ['Sustained Hydration', 'Photosynthetic Tissue'] }
  ];

  const handlePark = () => {
    if (gameState.currentDinosaur && gameState.isAlive) {
      alert(`${gameState.currentDinosaur.name} has been parked and moved to your inventory!`);
    } else {
      alert('No dinosaur to park or dinosaur is dead.');
    }
  };

  const handleRedeem = () => {
    // Navigate to dedicated dinosaur selection page
    navigate('/dinosaur-selection');
  };

  const handleSlay = async () => {
    if (gameState.currentDinosaur && gameState.isAlive) {
      const confirmed = window.confirm(`Are you sure you want to slay your ${gameState.currentDinosaur.name}? This action cannot be undone.`);
      if (confirmed) {
        try {
          // Get the current user's Steam data for the slay command
          const userData = JSON.parse(localStorage.getItem('steamUser') || localStorage.getItem('discordUser') || '{}');
          
          // For now, use your known Isle player name
          // TODO: Make this configurable or auto-detect
          const islePlayerName = "Misplacedcursor"; // Your actual Isle player name
          
          // Steam data for reference
          const steamId = userData.steamId || userData.steam_id;
          const steamName = userData.displayName || userData.username;
          
          // Log what data we have for debugging
          console.log('🔍 Player data:', {
            islePlayerName: islePlayerName,
            steamId: steamId,
            steamName: steamName
          });
          
          console.log(`🎯 Sending slay command for Isle player: ${islePlayerName}`);
          console.log('🎯 Sending slay command via Netlify function...');
          
          // Send slay command to Netlify function (which calls your VPS RCON bridge)
          const response = await fetch('/.netlify/functions/slay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              playerName: islePlayerName,
              steamId: steamId
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Slay command successful:', result);
            alert(`🎯 Slay command sent successfully!\n\nTarget: ${islePlayerName}\nServer Response: ${result.message || 'Command executed'}`);
          } else {
            console.error('❌ Slay command failed:', response.status);
            alert(`❌ Failed to send slay command. Server returned status: ${response.status}`);
          }
        } catch (error) {
          console.error('❌ Error sending slay command:', error);
          alert(`❌ Error sending slay command: ${error.message}\n\nThis might be normal if you're not currently in-game.`);
        }
      }
    } else {
      alert('No dinosaur to slay or dinosaur is already dead.');
    }
  };

  return (
    <div className="game-manager">
      <div className="game-status">
        <h3>Game Status</h3>
        <div className="status-info">
          <div className="status-item">
            <span className="label">Connection:</span>
            <span className={`value ${gameState.isInGame ? 'connected' : 'disconnected'}`}>
              {gameState.isInGame ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
          
          {gameState.currentDinosaur && (
            <>
              <div className="status-item">
                <span className="label">Current Dinosaur:</span>
                <span className="value">{gameState.currentDinosaur.name}</span>
              </div>
              <div className="status-item">
                <span className="label">Health:</span>
                <span className="value">{gameState.currentDinosaur.health}%</span>
              </div>
              <div className="status-item">
                <span className="label">Hunger:</span>
                <span className="value">{gameState.currentDinosaur.hunger}%</span>
              </div>
              <div className="status-item">
                <span className="label">Thirst:</span>
                <span className="value">{gameState.currentDinosaur.thirst}%</span>
              </div>
              <div className="status-item">
                <span className="label">Location:</span>
                <span className="value">{gameState.currentDinosaur.location}</span>
              </div>
              <div className="status-item">
                <span className="label">Status:</span>
                <span className={`value ${gameState.isAlive ? 'alive' : 'dead'}`}>
                  {gameState.isAlive ? '🟢 Alive' : '💀 Dead'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="game-actions">
        <h3>Game Management</h3>
        <div className="action-buttons">
          <button 
            className="park-btn"
            onClick={handlePark}
            disabled={!gameState.currentDinosaur || !gameState.isAlive}
            title="Move current dinosaur to inventory"
          >
            Park Dinosaur
          </button>
          
          <button 
            className="redeem-btn"
            onClick={handleRedeem}
            title="Spawn a dinosaur from inventory"
          >
            Redeem Dinosaur
          </button>
          
          <button 
            className="slay-btn"
            onClick={handleSlay}
            disabled={!gameState.currentDinosaur || !gameState.isAlive}
            title="Kill current dinosaur"
          >
            Slay Dinosaur
          </button>
        </div>
      </div>

      <div className="quick-stats">
        <h4>Quick Stats</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{mockInventory.length}</span>
            <span className="stat-label">Inventory</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">42</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">245h</span>
            <span className="stat-label">Playtime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameManager;