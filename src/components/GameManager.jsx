import React, { useState } from 'react';
import './GameManager.css';

function GameManager({ gameState, onRedeem, onSelectDino }) {
  const [selectedInventoryDino, setSelectedInventoryDino] = useState(null);
  const [showInventory, setShowInventory] = useState(false);

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
    if (selectedInventoryDino) {
      onSelectDino(selectedInventoryDino);
      onRedeem();
    } else {
      alert('Please select a dinosaur from your inventory first.');
    }
  };

  const handleSlay = () => {
    if (gameState.currentDinosaur && gameState.isAlive) {
      const confirmed = window.confirm(`Are you sure you want to slay your ${gameState.currentDinosaur.name}? This action cannot be undone.`);
      if (confirmed) {
        alert(`${gameState.currentDinosaur.name} has been slain.`);
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
            onClick={() => setShowInventory(true)}
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

      {/* Inventory Modal */}
      {showInventory && (
        <div className="modal-overlay">
          <div className="inventory-modal">
            <div className="modal-header">
              <h3>Select Dinosaur to Redeem</h3>
              <button 
                className="close-btn"
                onClick={() => setShowInventory(false)}
              >
                ×
              </button>
            </div>
            
            <div className="inventory-grid">
              {mockInventory.map(dino => (
                <div 
                  key={dino.id}
                  className={`inventory-item ${selectedInventoryDino?.id === dino.id ? 'selected' : ''}`}
                  onClick={() => setSelectedInventoryDino(dino)}
                >
                  <div className="dino-info">
                    <h4>{dino.name}</h4>
                    <p>Level {dino.level}</p>
                    <div className="mutations-preview">
                      {dino.mutations.length > 0 ? (
                        <span>{dino.mutations.length} mutations</span>
                      ) : (
                        <span className="no-mutations">No mutations</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button 
                className="confirm-redeem-btn"
                onClick={handleRedeem}
                disabled={!selectedInventoryDino}
              >
                Select Mutations & Redeem
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowInventory(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameManager;