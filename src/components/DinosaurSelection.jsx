import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MutationSelector from './MutationSelector';
import './DinosaurSelection.css';

function DinosaurSelection() {
  const navigate = useNavigate();
  const [selectedDino, setSelectedDino] = useState(null);
  const [showMutationSelector, setShowMutationSelector] = useState(false);

  // Mock inventory data - matching your inventory with mutations count
  const mockInventory = [
    { id: 1, name: 'Allosaurus', level: 5, mutations: 2, mutationsList: ['Cellular Regeneration', 'Featherweight'] },
    { id: 2, name: 'Triceratops', level: 3, mutations: 1, mutationsList: ['Osteosclerosis'] },
    { id: 3, name: 'Carnotaurus', level: 7, mutations: 3, mutationsList: ['Nocturnal', 'Hydrodynamic', 'Epidermal Fibrosis'] },
    { id: 4, name: 'Dryosaurus', level: 2, mutations: 0, mutationsList: [] },
    { id: 5, name: 'Stegosaurus', level: 4, mutations: 2, mutationsList: ['Sustained Hydration', 'Photosynthetic Tissue'] }
  ];

  const handleConfirm = () => {
    if (selectedDino) {
      setShowMutationSelector(true);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleRedeemWithMutations = async (mutations, playerName) => {
    try {
      const response = await fetch('/api/shop/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName || 'Player',
          category: 'dinosaurs',
          itemName: selectedDino.name,
          mutations: mutations,
          cost: 0 // Free redemption from inventory
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Successfully redeemed ${selectedDino.name} with ${mutations.length} mutations!`);
        navigate('/games');
      } else {
        alert(`Redemption failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Connection error: ${error.message}`);
    }
  };

  return (
    <div className="dinosaur-selection-page">
      <div className="dino-selection-container">
        <div className="dino-selection-header">
          <h1>Select Dinosaur to Redeem</h1>
          <p>Choose a dinosaur from your inventory to redeem with mutations</p>
        </div>

        <div className="dino-selection-grid">
          {mockInventory.map(dino => (
            <div 
              key={dino.id}
              className={`dino-selection-card ${selectedDino?.id === dino.id ? 'selected' : ''}`}
              onClick={() => setSelectedDino(dino)}
            >
              <div className="dino-card-content">
                <h3>{dino.name}</h3>
                <p className="dino-level">Level {dino.level}</p>
                <div className="dino-mutations">
                  {dino.mutations === 0 ? (
                    <span className="no-mutations">No mutations</span>
                  ) : (
                    <span className="mutation-count">{dino.mutations} mutations</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="dino-selection-actions">
          <button 
            className="confirm-selection-btn"
            onClick={handleConfirm}
            disabled={!selectedDino}
          >
            Continue
          </button>
          <button 
            className="cancel-selection-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Mutation Selector Modal */}
      {showMutationSelector && selectedDino && (
        <MutationSelector
          selectedDinosaur={selectedDino}
          onRedeem={handleRedeemWithMutations}
          onClose={() => setShowMutationSelector(false)}
        />
      )}
    </div>
  );
}

export default DinosaurSelection;