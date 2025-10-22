import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DinosaurSelection.css';

function DinosaurSelection() {
  const navigate = useNavigate();
  const [selectedDino, setSelectedDino] = useState(null);

  // Mock inventory data - same as GameManager
  const mockInventory = [
    { id: 1, name: 'Allosaurus', level: 5, mutations: ['Cellular Regeneration', 'Featherweight'] },
    { id: 2, name: 'Triceratops', level: 3, mutations: ['Osteosclerosis'] },
    { id: 3, name: 'Carnotaurus', level: 7, mutations: ['Nocturnal', 'Hydrodynamic', 'Epidermal Fibrosis'] },
    { id: 4, name: 'Dryosaurus', level: 2, mutations: [] },
    { id: 5, name: 'Stegosaurus', level: 4, mutations: ['Sustained Hydration', 'Photosynthetic Tissue'] }
  ];

  const handleConfirm = () => {
    if (selectedDino) {
      // Navigate to redeem page with selected dinosaur
      navigate('/redeem', { 
        state: { 
          selectedDinosaur: selectedDino,
          fromGameManager: true 
        } 
      });
    }
  };

  const handleCancel = () => {
    // Go back to previous page (Games)
    navigate(-1);
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
                  {dino.mutations.length > 0 ? (
                    <span className="mutation-count">{dino.mutations.length} mutations</span>
                  ) : (
                    <span className="no-mutations">No mutations</span>
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
            Select Mutations & Redeem
          </button>
          <button 
            className="cancel-selection-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DinosaurSelection;