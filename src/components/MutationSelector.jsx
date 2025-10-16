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
          
          for (let i = 3; i < 6; i++) {
            if (prev[i] === null) {
              const newMutations = [...prev];
              newMutations[i] = mutationId;
              return newMutations;
            }
          }
        } else {
          for (let i = 0; i < 3; i++) {
            if (prev[i] === null) {
              const newMutations = [...prev];
              newMutations[i] = mutationId;
              return newMutations;
            }
          }
        }
        
        return prev;
      }
    });
  };

  const handleRedeem = () => {
    const activeMutations = selectedMutations.filter(m => m !== null);
    if (activeMutations.length === 0) {
      alert('Please select at least one mutation before redeeming.');
      return;
    }
    onRedeem(activeMutations, '');
    onClose();
  };

  const handleClear = () => {
    setSelectedMutations(Array(6).fill(null));
  };

  return (
    <div className="redeem-modal-overlay">
      <div className="redeem-modal">
        {/* Header */}
        <div className="redeem-header">
          <h2>Redeem {selectedDinosaur?.name || 'Dinosaur'}</h2>
          <p>Select mutations for your {selectedDinosaur?.name || 'dinosaur'}</p>
        </div>

        {/* Search and Filter */}
        <div className="redeem-controls">
          <input
            type="text"
            placeholder="Search mutations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">All Mutations</option>
            <option value="mainMutations">Main Mutations</option>
            <option value="parentMutations">Parent Mutations</option>
          </select>
        </div>

        {/* Selected Mutations Display */}
        <div className="selected-section">
          <h3>Selected Mutations ({selectedMutations.filter(m => m !== null).length}/{MAX_MUTATIONS})</h3>
          <div className="mutation-slots">
            {selectedMutations.map((mutationId, index) => {
              const slotType = index < 3 ? 'Main' : 'Parent';
              const slotNumber = (index % 3) + 1;
              const mutation = mutationId ? getAllMutations().find(m => m.id === mutationId) : null;
              
              return (
                <div key={index} className={`mutation-slot ${mutation ? 'filled' : ''} ${index >= 3 ? 'parent-slot' : ''}`}>
                  {mutation ? mutation.name : `${slotType} ${slotNumber}`}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mutations Grid */}
        <div className="mutations-container">
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
                  <div className="mutation-tag">
                    {mutation.category === 'mainMutations' ? 'MAIN' : 'PARENT'}
                  </div>
                  <h4>{mutation.name}</h4>
                  <p>{mutation.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="redeem-actions">
          <button 
            className="btn-redeem" 
            onClick={handleRedeem}
            disabled={selectedMutations.filter(m => m !== null).length === 0}
          >
            REDEEM DINOSAUR
          </button>
          <button 
            className="btn-clear" 
            onClick={handleClear}
            disabled={selectedMutations.filter(m => m !== null).length === 0}
          >
            CLEAR ALL
          </button>
          <button className="btn-cancel" onClick={onClose}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

export default MutationSelector;