import React, { useState, useMemo } from 'react';
import { getAllMutations, getMutationsByCategory, searchMutations } from '../data/mutationDatabase';
import './MutationSelector.css';

function MutationSelector({ selectedDinosaur, onRedeem, onClose }) {
  const [selectedMutations, setSelectedMutations] = useState(Array(6).fill(null));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState([
    { name: 'Tank Build', mutations: ['cellular-regeneration', 'osteosclerosis', 'epidermal-fibrosis'] },
    { name: 'Speed Build', mutations: ['featherweight', 'hydrodynamic', 'nocturnal'] }
  ]);
  const [showPresets, setShowPresets] = useState(false);

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
        return prev.filter(id => id !== mutationId);
      } else if (prev.length < MAX_MUTATIONS) {
        // Check if trying to select a parent mutation
        if (mutation.category === 'parentMutations') {
          // Count current main mutations
          const currentMainMutations = prev.filter(id => {
            const mut = getAllMutations().find(m => m.id === id);
            return mut && mut.category === 'mainMutations';
          });
          
          // Must have at least one main mutation before selecting parent mutations
          if (currentMainMutations.length === 0) {
            alert('You must select at least one main mutation before selecting parent mutations.');
            return prev;
          }
          
          // Check if parent slots (4-6) are available
          const parentSlots = prev.slice(3, 6);
          const availableParentSlots = parentSlots.filter(slot => !slot).length;
          
          if (availableParentSlots === 0) {
            alert('All parent mutation slots (4-6) are full.');
            return prev;
          }
        } else if (mutation.category === 'mainMutations') {
          // Check if main slots (1-3) are available
          const mainSlots = prev.slice(0, 3);
          const availableMainSlots = mainSlots.filter(slot => !slot).length;
          
          if (availableMainSlots === 0) {
            alert('All main mutation slots (1-3) are full.');
            return prev;
          }
        }
        
        // Add mutation to appropriate slot
        const newMutations = [...prev];
        if (mutation.category === 'mainMutations') {
          // Find first available main slot (0-2)
          for (let i = 0; i < 3; i++) {
            if (!newMutations[i]) {
              newMutations[i] = mutationId;
              break;
            }
          }
        } else {
          // Find first available parent slot (3-5)
          for (let i = 3; i < 6; i++) {
            if (!newMutations[i]) {
              newMutations[i] = mutationId;
              break;
            }
          }
        }
        return newMutations;
      }
      return prev;
    });
  };

  const handleSavePreset = () => {
    const activeMutations = selectedMutations.filter(m => m !== null);
    if (presetName.trim() && activeMutations.length > 0) {
      const newPreset = {
        name: presetName.trim(),
        mutations: [...activeMutations]
      };
      setSavedPresets(prev => [...prev, newPreset]);
      setPresetName('');
      alert(`Preset "${newPreset.name}" saved!`);
    }
  };

  const handleLoadPreset = (preset) => {
    const newMutations = Array(6).fill(null);
    preset.mutations.forEach((mutationId, index) => {
      const mutation = getAllMutations().find(m => m.id === mutationId);
      if (mutation) {
        if (mutation.category === 'mainMutations' && index < 3) {
          newMutations[index] = mutationId;
        } else if (mutation.category === 'parentMutations' && index >= 3) {
          newMutations[index] = mutationId;
        }
      }
    });
    setSelectedMutations(newMutations);
    setShowPresets(false);
  };

  const handleRedeem = () => {
    const activeMutations = selectedMutations.filter(m => m !== null);
    onRedeem(activeMutations, presetName);
  };

  return (
    <div className="mutation-selector-overlay">
      <div className="mutation-selector">
        <div className="mutation-header">
          <h2>Redeem - {selectedDinosaur?.name || 'Select Dinosaur'}</h2>
          <p>You are about to redeem {selectedDinosaur?.name || 'dinosaur'}.</p>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="mutation-controls">
          <div className="search-filter-section">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mutation-search"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mutation-filter"
            >
              <option value="all">All Mutations</option>
              <option value="mainMutations">Main Mutations</option>
              <option value="parentMutations">Parent Mutations</option>
            </select>
          </div>

          <div className="action-buttons">
            <div className="preset-section">
              <input
                type="text"
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="preset-name-input"
              />
              <button 
                className="save-preset-btn"
                onClick={handleSavePreset}
                disabled={!presetName.trim() || selectedMutations.filter(m => m !== null).length === 0}
              >
                Save Current
              </button>
              <button 
                className="load-preset-btn"
                onClick={() => setShowPresets(!showPresets)}
              >
                Load Preset
              </button>
            </div>
            
            <button 
              className="redeem-btn"
              onClick={handleRedeem}
              disabled={selectedMutations.filter(m => m !== null).length === 0}
            >
              Redeem
            </button>
          </div>
        </div>

        {showPresets && (
          <div className="presets-dropdown">
            <h4>Saved Presets</h4>
            {savedPresets.map((preset, index) => (
              <div key={index} className="preset-item" onClick={() => handleLoadPreset(preset)}>
                <span className="preset-name">{preset.name}</span>
                <span className="preset-count">{preset.mutations.length} mutations</span>
              </div>
            ))}
          </div>
        )}

        <div className="mutation-selection-info">
          <h4>Selected Mutations ({selectedMutations.filter(m => m !== null).length}/{MAX_MUTATIONS})</h4>
          <p className="mutation-info-text">
            <strong>Note:</strong> You must select at least one Main mutation (slots 1-3) before you can select Parent mutations (slots 4-6).
          </p>
          <div className="selected-slots">
            {Array.from({ length: MAX_MUTATIONS }, (_, index) => {
              const slotType = index < 3 ? 'Main Mutation' : 'Parent Mutation';
              const slotNumber = (index % 3) + 1;
              return (
                <div key={index} className={`mutation-slot ${selectedMutations[index] ? 'filled' : 'empty'} ${index < 3 ? 'main-slot' : 'parent-slot'}`}>
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
      </div>
    </div>
  );
}

export default MutationSelector;