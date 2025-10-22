import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import './SkinDesigner.css';

function SkinDesigner() {
  const [selectedDinosaur, setSelectedDinosaur] = useState('Carnotaurus');
  const [selectedSkin, setSelectedSkin] = useState('default');
  const [customPresets, setCustomPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { updateCurrency, currencies } = useCurrency();

  // Available dinosaurs (matching your existing system)
  const availableDinosaurs = [
    { name: 'Carnotaurus', category: 'Large Carnivore', icon: '🦖' },
    { name: 'Allosaurus', category: 'Large Carnivore', icon: '🦕' },
    { name: 'Ceratosaurus', category: 'Large Carnivore', icon: '🦴' },
    { name: 'Dilophosaurus', category: 'Medium Carnivore', icon: '🦎' },
    { name: 'Herrerasaurus', category: 'Small Carnivore', icon: '🐊' },
    { name: 'Triceratops', category: 'Large Herbivore', icon: '🦏' },
    { name: 'Stegosaurus', category: 'Large Herbivore', icon: '🦕' },
    { name: 'Maiasaura', category: 'Medium Herbivore', icon: '🦆' },
    { name: 'Gallimimus', category: 'Small Herbivore', icon: '🦌' },
    { name: 'Dryosaurus', category: 'Small Herbivore', icon: '🐰' }
  ];

  // Available skins (starting with basic ones)
  const availableSkins = [
    {
      id: 'default',
      name: 'Default',
      description: 'Natural species coloration',
      cost: 0,
      currency: 'Free',
      rarity: 'Common',
      color: '#8B4513',
      preview: 'Standard natural colors for this species'
    },
    {
      id: 'albino',
      name: 'Albino',
      description: 'Pure white coloration with pink eyes',
      cost: 500,
      currency: 'Void Pearls',
      rarity: 'Rare',
      color: '#F5F5F5',
      preview: 'Striking white appearance that stands out'
    },
    {
      id: 'melanistic',
      name: 'Melanistic',
      description: 'Deep black coloration',
      cost: 500,
      currency: 'Void Pearls',
      rarity: 'Rare',
      color: '#1C1C1C',
      preview: 'Dark, intimidating black coloration'
    },
    {
      id: 'leucistic',
      name: 'Leucistic',
      description: 'Partial white with normal eyes',
      cost: 750,
      currency: 'Void Pearls',
      rarity: 'Epic',
      color: '#E6E6FA',
      preview: 'Pale coloration with retained eye color'
    },
    // Placeholder for future modded skins
    {
      id: 'coming_soon_1',
      name: 'Tiger Stripes',
      description: 'Orange with black stripes',
      cost: 1000,
      currency: 'Void Pearls',
      rarity: 'Legendary',
      color: '#FF4500',
      preview: 'Requires server skin mods - Coming Soon!',
      locked: true
    },
    {
      id: 'coming_soon_2',
      name: 'Forest Green',
      description: 'Natural forest camouflage',
      cost: 1000,
      currency: 'Void Pearls',
      rarity: 'Legendary',
      color: '#228B22',
      preview: 'Requires server skin mods - Coming Soon!',
      locked: true
    }
  ];

  // Load saved presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('skinDesignerPresets');
    if (savedPresets) {
      setCustomPresets(JSON.parse(savedPresets));
    }
  }, []);

  const handleDinosaurSelect = (dinosaur) => {
    setSelectedDinosaur(dinosaur);
  };

  const handleSkinSelect = (skinId) => {
    const skin = availableSkins.find(s => s.id === skinId);
    if (skin && !skin.locked) {
      setSelectedSkin(skinId);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a name for your preset');
      return;
    }

    const preset = {
      id: Date.now().toString(),
      name: presetName,
      dinosaur: selectedDinosaur,
      skin: selectedSkin,
      created: new Date().toISOString()
    };

    const updatedPresets = [...customPresets, preset];
    setCustomPresets(updatedPresets);
    localStorage.setItem('skinDesignerPresets', JSON.stringify(updatedPresets));
    
    setShowSaveModal(false);
    setPresetName('');
    alert(`Preset "${preset.name}" saved successfully!`);
  };

  const handleLoadPreset = (preset) => {
    setSelectedDinosaur(preset.dinosaur);
    setSelectedSkin(preset.skin);
    alert(`Loaded preset: ${preset.name}`);
  };

  const handleDeletePreset = (presetId) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      const updatedPresets = customPresets.filter(p => p.id !== presetId);
      setCustomPresets(updatedPresets);
      localStorage.setItem('skinDesignerPresets', JSON.stringify(updatedPresets));
    }
  };

  const handleApplySkin = async () => {
    const selectedSkinData = availableSkins.find(s => s.id === selectedSkin);
    
    if (selectedSkinData.cost > 0) {
      if (currencies['Void Pearls'] < selectedSkinData.cost) {
        alert(`Insufficient ${selectedSkinData.currency}! You need ${selectedSkinData.cost} but only have ${currencies['Void Pearls']}.`);
        return;
      }
    }

    try {
      // Here we'll integrate with your existing RCON system
      const response = await fetch('/api/skins/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dinosaur: selectedDinosaur,
          skin: selectedSkin,
          playerName: 'TestPlayer', // This would come from auth context
          steamId: '76561198123456789' // This would come from auth context
        })
      });

      if (response.ok) {
        // Deduct currency if skin costs something
        if (selectedSkinData.cost > 0) {
          updateCurrency('Void Pearls', -selectedSkinData.cost);
        }
        
        alert(`🎉 Successfully applied ${selectedSkinData.name} skin to your ${selectedDinosaur}! Check in-game.`);
      } else {
        const error = await response.json();
        alert(`Failed to apply skin: ${error.message}`);
      }
    } catch (error) {
      // For now, simulate success since backend isn't fully set up
      console.log('Simulating skin application:', { selectedDinosaur, selectedSkin });
      alert(`🎭 [DEMO MODE] Applied ${selectedSkinData.name} to ${selectedDinosaur}!\n\nThis will work with your RCON system once backend is running.`);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Common': return '#808080';
      case 'Rare': return '#0080FF';
      case 'Epic': return '#8000FF';
      case 'Legendary': return '#FF8000';
      default: return '#808080';
    }
  };

  const selectedSkinData = availableSkins.find(s => s.id === selectedSkin);
  const selectedDinosaurData = availableDinosaurs.find(d => d.name === selectedDinosaur);

  return (
    <div className="skin-designer">
      <div className="skin-designer-header">
        <h1>🎨 Ashveil Skin Designer</h1>
        <p>Customize your dinosaur's appearance and apply skins in-game!</p>
      </div>

      <div className="skin-designer-content">
        {/* Dinosaur Selection */}
        <div className="designer-section">
          <h2>🦕 Select Dinosaur</h2>
          <div className="dinosaur-grid">
            {availableDinosaurs.map(dino => (
              <div 
                key={dino.name}
                className={`dinosaur-card ${selectedDinosaur === dino.name ? 'selected' : ''}`}
                onClick={() => handleDinosaurSelect(dino.name)}
              >
                <div className="dinosaur-icon">{dino.icon}</div>
                <h3>{dino.name}</h3>
                <p>{dino.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skin Selection */}
        <div className="designer-section">
          <h2>🎨 Choose Skin</h2>
          <div className="skin-grid">
            {availableSkins.map(skin => (
              <div 
                key={skin.id}
                className={`skin-card ${selectedSkin === skin.id ? 'selected' : ''} ${skin.locked ? 'locked' : ''}`}
                onClick={() => handleSkinSelect(skin.id)}
              >
                <div 
                  className="skin-preview"
                  style={{ backgroundColor: skin.color }}
                >
                  {skin.locked && <div className="lock-icon">🔒</div>}
                </div>
                <h3>{skin.name}</h3>
                <p className="skin-description">{skin.description}</p>
                <div className="skin-cost">
                  {skin.cost === 0 ? (
                    <span className="free">Free</span>
                  ) : (
                    <span>{skin.cost} {skin.currency}</span>
                  )}
                </div>
                <div 
                  className="skin-rarity"
                  style={{ color: getRarityColor(skin.rarity) }}
                >
                  {skin.rarity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="designer-section">
            <h2>👀 Preview</h2>
            <div className="preview-area">
              <div className="preview-card">
                <div className="preview-header">
                  <h3>{selectedDinosaurData?.icon} {selectedDinosaur}</h3>
                  <h4>with {selectedSkinData?.name} Skin</h4>
                </div>
                <div 
                  className="preview-display"
                  style={{ backgroundColor: selectedSkinData?.color }}
                >
                  <div className="dinosaur-silhouette">
                    {selectedDinosaurData?.icon}
                  </div>
                </div>
                <div className="preview-details">
                  <p><strong>Skin:</strong> {selectedSkinData?.name}</p>
                  <p><strong>Rarity:</strong> <span style={{ color: getRarityColor(selectedSkinData?.rarity) }}>{selectedSkinData?.rarity}</span></p>
                  <p><strong>Description:</strong> {selectedSkinData?.preview}</p>
                  {selectedSkinData?.cost > 0 && (
                    <p><strong>Cost:</strong> {selectedSkinData.cost} {selectedSkinData.currency}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="designer-section">
          <div className="action-buttons">
            <button 
              className="btn-primary apply-skin-btn"
              onClick={handleApplySkin}
              disabled={selectedSkinData?.locked}
            >
              🎮 Apply to Game
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowSaveModal(true)}
            >
              💾 Save Preset
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '🙈 Hide Preview' : '👁️ Show Preview'}
            </button>
          </div>
        </div>

        {/* Saved Presets */}
        {customPresets.length > 0 && (
          <div className="designer-section">
            <h2>📂 Saved Presets</h2>
            <div className="presets-grid">
              {customPresets.map(preset => {
                const presetSkin = availableSkins.find(s => s.id === preset.skin);
                const presetDino = availableDinosaurs.find(d => d.name === preset.dinosaur);
                return (
                  <div key={preset.id} className="preset-card">
                    <h3>{preset.name}</h3>
                    <p>{presetDino?.icon} {preset.dinosaur}</p>
                    <p>🎨 {presetSkin?.name}</p>
                    <div className="preset-actions">
                      <button 
                        className="btn-small"
                        onClick={() => handleLoadPreset(preset)}
                      >
                        Load
                      </button>
                      <button 
                        className="btn-small btn-danger"
                        onClick={() => handleDeletePreset(preset.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>💾 Save Skin Preset</h3>
              <button 
                className="close-modal"
                onClick={() => setShowSaveModal(false)}
              >
                ✖
              </button>
            </div>
            <div className="modal-content">
              <p>Save this combination: <strong>{selectedDinosaur}</strong> with <strong>{selectedSkinData?.name}</strong></p>
              <input
                type="text"
                placeholder="Enter preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="preset-name-input"
                maxLength={30}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn-primary"
                onClick={handleSavePreset}
              >
                Save Preset
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowSaveModal(false)}
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

export default SkinDesigner;