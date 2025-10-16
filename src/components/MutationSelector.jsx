import React, { useState, useMemo } from 'react';
import { getAllMutations, getMutationsByCategory, searchMutations } from '../data/mutationDatabase';
import './MutationSelector.css';

function MutationSelector({ selectedDinosaur, onRedeem, onClose }) {
  const [selectedMutations, setSelectedMutations] = useState(Array(6).fill(null));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const MAX_MUTATIONS = 6;

  const filteredMutations = useMemo(() => {
    let mutations;
    if (selectedCategory === 'all') {
      mutations = getAllMutations();
    } else if (selectedCategory === 'mainMutations') {
      mutations = getMutationsByCategory('mainMutations');
    } else if (selectedCategory === 'parentMutations') {
      mutations = getMutationsByCategory('parentMutations');
    }
    
    if (searchQuery) {
      mutations = searchMutations(searchQuery, selectedCategory);
    }
    
    return mutations;
  }, [searchQuery, selectedCategory]);

  const handleMutationToggle = (mutationId) => {
    const mutation = getAllMutations().find(m => m.id === mutationId);
    
    setSelectedMutations(prev => {
      if (prev.includes(mutationId)) {
        return prev.map(id => id === mutationId ? null : id);
      } else {
        const activeMutations = prev.filter(m => m !== null);
        if (activeMutations.length >= MAX_MUTATIONS) {
          alert('All mutation slots are full.');
          return prev;
        }
        
        if (mutation.category === 'parentMutations') {
          const currentMainMutations = prev.slice(0, 3).filter(id => {
            if (!id) return false;
            const mut = getAllMutations().find(m => m.id === id);
            return mut && mut.category === 'mainMutations';
          });
          
          if (currentMainMutations.length === 0) {
            alert('You must select at least one main mutation before selecting parent mutations.');
            return prev;
          }
          
          const parentSlots = prev.slice(3, 6);
          const availableParentSlots = parentSlots.filter(slot => slot === null).length;
          
          if (availableParentSlots === 0) {
            alert('All parent mutation slots (4-6) are full.');
            return prev;
          }
        } else if (mutation.category === 'mainMutations') {
          const mainSlots = prev.slice(0, 3);
          const availableMainSlots = mainSlots.filter(slot => slot === null).length;
          
          if (availableMainSlots === 0) {
            alert('All main mutation slots (1-3) are full.');
            return prev;
          }
        }
        
        const newMutations = [...prev];
        if (mutation.category === 'mainMutations') {
          for (let i = 0; i < 3; i++) {
            if (newMutations[i] === null) {
              newMutations[i] = mutationId;
              break;
            }
          }
        } else {
          for (let i = 3; i < 6; i++) {
            if (newMutations[i] === null) {
              newMutations[i] = mutationId;
              break;
            }
          }
        }
        return newMutations;
      }
    });
  };

  const handleRedeem = () => {
    const activeMutations = selectedMutations.filter(m => m !== null);
    onRedeem(activeMutations, '');
  };

  const handleClear = () => {
    setSelectedMutations(Array(6).fill(null));
  };

  return (
    <div className="mutation-selector-overlay active">
      <div className="mutation-selector">
        <div className="mutation-header">
          <h2>Redeem - {selectedDinosaur?.name || 'Select Dinosaur'}</h2>
          <p>You are about to redeem {selectedDinosaur?.name || 'dinosaur'}.</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="mutation-content">
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px solid #666',
                borderRadius: '8px',
                color: '#ccc',
                padding: '12px',
                fontSize: '1rem',
                width: '300px',
                marginRight: '16px'
              }}
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '2px solid #666',
                borderRadius: '8px',
                color: '#ccc',
                padding: '12px',
                fontSize: '1rem'
              }}
            >
              <option value="all">All Mutations</option>
              <option value="mainMutations">Main Mutations</option>
              <option value="parentMutations">Parent Mutations</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: '#FF4500', margin: '0 0 16px 0' }}>
              Selected Mutations ({selectedMutations.filter(m => m !== null).length}/{MAX_MUTATIONS})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {Array.from({ length: MAX_MUTATIONS }, (_, index) => {
                const slotType = index < 3 ? 'Main Mutation' : 'Parent Mutation';
                const slotNumber = (index % 3) + 1;
                return (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: `2px solid ${selectedMutations[index] ? '#FF4500' : '#666'}`,
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      color: selectedMutations[index] ? '#ccc' : '#666',
                      borderLeft: `4px solid ${index < 3 ? '#FF4500' : '#4ade80'}`
                    }}
                  >
                    {selectedMutations[index] ? 
                      getAllMutations().find(m => m.id === selectedMutations[index])?.name : 
                      `${slotType} ${slotNumber}`
                    }
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mutations-grid">
            {filteredMutations.map(mutation => {
              const hasMainMutation = selectedMutations.slice(0, 3).some(id => {
                if (!id) return false;
                const mut = getAllMutations().find(m => m.id === id);
                return mut && mut.category === 'mainMutations';
              });
              
              const isDisabled = mutation.category === 'parentMutations' && !hasMainMutation;
              const isSelected = selectedMutations.includes(mutation.id);
              
              return (
                <div
                  key={mutation.id}
                  className={`mutation-card ${isSelected ? 'selected' : ''} ${mutation.category} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && handleMutationToggle(mutation.id)}
                >
                  <h4 className="mutation-name">{mutation.name}</h4>
                  <p className="mutation-description">{mutation.description}</p>
                  <span className="mutation-category">{mutation.category === 'mainMutations' ? 'MAIN' : 'PARENT'}</span>
                </div>
              );
            })}
          </div>

          <div className="action-buttons">
            <button
              className="redeem-button"
              onClick={handleRedeem}
              disabled={selectedMutations.filter(m => m !== null).length === 0}
            >
              REDEEM
            </button>
            <button
              className="clear-button"
              onClick={handleClear}
              disabled={selectedMutations.filter(m => m !== null).length === 0}
            >
              CLEAR ALL
            </button>
            <button
              className="cancel-button"
              onClick={onClose}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MutationSelector;