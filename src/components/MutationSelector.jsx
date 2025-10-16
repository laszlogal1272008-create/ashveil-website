import React, { useState, useMemo } from 'react';
import { getAllMutations, getMutationsByCategory, searchMutations } from '../data/mutationDatabase';
import './MutationSelector.css';

function MutationSelector({ selectedDinosaur, onRedeem, onClose }) {
  const [selectedMutations, setSelectedMutations] = useState([]);
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
    setSelectedMutations(prev => {
      if (prev.includes(mutationId)) {
        return prev.filter(id => id !== mutationId);
      } else if (prev.length < MAX_MUTATIONS) {
        return [...prev, mutationId];
      }
      return prev;
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim() && selectedMutations.length > 0) {
      const newPreset = {
        name: presetName.trim(),
        mutations: [...selectedMutations]
      };
      setSavedPresets(prev => [...prev, newPreset]);
      setPresetName('');
      alert(`Preset "${newPreset.name}" saved!`);
    }
  };

  const handleLoadPreset = (preset) => {
    setSelectedMutations([...preset.mutations]);
    setShowPresets(false);
  };

  const handleRedeem = () => {
    onRedeem(selectedMutations, presetName);
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
                disabled={!presetName.trim() || selectedMutations.length === 0}
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
              disabled={selectedMutations.length === 0}
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
          <h4>Selected Mutations ({selectedMutations.length}/{MAX_MUTATIONS})</h4>
          <div className="selected-slots">
            {Array.from({ length: MAX_MUTATIONS }, (_, index) => (
              <div key={index} className={`mutation-slot ${selectedMutations[index] ? 'filled' : 'empty'}`}>
                {selectedMutations[index] ? 
                  getAllMutations().find(m => m.id === selectedMutations[index])?.name : 
                  `Slot ${index + 1}`
                }
              </div>
            ))}
          </div>
        </div>

        <div className="mutations-grid">
          {filteredMutations.map(mutation => (
            <div
              key={mutation.id}
              className={`mutation-card ${selectedMutations.includes(mutation.id) ? 'selected' : ''} ${mutation.category}`}
              onClick={() => handleMutationToggle(mutation.id)}
            >
              <h4 className="mutation-name">{mutation.name}</h4>
              <p className="mutation-description">{mutation.description}</p>
              <span className="mutation-category">{mutation.category === 'mainMutations' ? 'Main' : 'Parent'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MutationSelector;