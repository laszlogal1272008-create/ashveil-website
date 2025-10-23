import React, { useState, useEffect } from 'react';
import './RedeemPage.css';

const RedeemPage = () => {
  const [playerName, setPlayerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('dinosaurs');
  const [selectedItem, setSelectedItem] = useState('');
  const [playerCurrency, setPlayerCurrency] = useState(500);
  const [redeemStatus, setRedeemStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Shop items with costs and mutations
  const shopItems = {
    dinosaurs: {
      'Carnotaurus': { 
        cost: 500, 
        mutations: ['Albino', 'Melanistic', 'Hyperodontosaurus'],
        description: 'Powerful apex predator with available mutations'
      },
      'Tyrannosaurus': { 
        cost: 1000, 
        mutations: ['Albino', 'Melanistic', 'Hyperodontosaurus', 'Achillobator'],
        description: 'King of dinosaurs - ultimate apex predator'
      },
      'Triceratops': { 
        cost: 300, 
        mutations: ['Albino', 'Melanistic'],
        description: 'Sturdy herbivore with defensive capabilities'
      },
      'Allosaurus': { 
        cost: 400, 
        mutations: ['Albino', 'Melanistic', 'Hyperodontosaurus'],
        description: 'Fast and agile carnivore'
      },
      'Dilophosaurus': { 
        cost: 200, 
        mutations: ['Albino', 'Melanistic'],
        description: 'Small but deadly pack hunter'
      },
      'Utahraptor': { 
        cost: 350, 
        mutations: ['Albino', 'Melanistic', 'Hyperodontosaurus'],
        description: 'Lightning-fast pack hunter'
      },
      'Stegosaurus': { 
        cost: 250, 
        mutations: ['Albino', 'Melanistic'],
        description: 'Heavily armored herbivore'
      }
    },
    perks: {
      'Full Heal': { 
        cost: 50, 
        description: 'Instantly restore your dinosaur to full health'
      },
      'Adult Growth': { 
        cost: 200, 
        description: 'Instantly grow your dinosaur to adult size'
      },
      'Half Growth': { 
        cost: 100, 
        description: 'Boost your dinosaur to 50% growth'
      },
      'Custom Teleport': { 
        cost: 75, 
        description: 'Teleport to any location on the map'
      },
      'Weather Control': { 
        cost: 150, 
        description: 'Change server weather for 30 minutes'
      }
    },
    mutations: {
      'Albino Mutation': { 
        cost: 300, 
        description: 'Pure white coloration - very rare!'
      },
      'Melanistic Mutation': { 
        cost: 350, 
        description: 'Pure black coloration - extremely rare!'
      },
      'Hyperodontosaurus Mutation': { 
        cost: 500, 
        description: 'Enhanced features and unique appearance'
      },
      'Achillobator Mutation': { 
        cost: 400, 
        description: 'Special mutation with enhanced abilities'
      }
    }
  };

  const [selectedMutations, setSelectedMutations] = useState([]);

  const handleRedemption = async () => {
    if (!playerName.trim()) {
      setRedeemStatus('❌ Please enter your player name');
      return;
    }

    if (!selectedItem) {
      setRedeemStatus('❌ Please select an item to redeem');
      return;
    }

    const item = shopItems[selectedCategory][selectedItem];
    if (playerCurrency < item.cost) {
      setRedeemStatus(`❌ Insufficient currency. Need ${item.cost}, have ${playerCurrency}`);
      return;
    }

    setIsLoading(true);
    setRedeemStatus('🔄 Processing redemption...');

    try {
      const response = await fetch('/api/shop/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          category: selectedCategory,
          itemName: selectedItem,
          mutations: selectedMutations,
          cost: item.cost
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPlayerCurrency(prev => prev - item.cost);
        setRedeemStatus(`✅ Successfully redeemed ${selectedItem}! Command sent to server.`);
        setSelectedItem('');
        setSelectedMutations([]);
      } else {
        setRedeemStatus(`❌ Redemption failed: ${result.error}`);
      }
    } catch (error) {
      setRedeemStatus(`❌ Connection error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMutationToggle = (mutation) => {
    setSelectedMutations(prev => 
      prev.includes(mutation) 
        ? prev.filter(m => m !== mutation)
        : [...prev, mutation]
    );
  };

  return (
    <div className="redeem-page">
      <div className="redeem-container">
        <h1>🛒 Currency Redemption Center</h1>
        <p>Redeem your earned currency for dinosaurs, perks, and mutations!</p>

        <div className="player-info">
          <div className="currency-display">
            💰 Current Currency: <span className="currency-amount">{playerCurrency}</span>
          </div>
          
          <div className="player-input">
            <label>Player Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your in-game name"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="category-selector">
          <button 
            className={selectedCategory === 'dinosaurs' ? 'active' : ''}
            onClick={() => setSelectedCategory('dinosaurs')}
          >
            🦕 Dinosaurs
          </button>
          <button 
            className={selectedCategory === 'perks' ? 'active' : ''}
            onClick={() => setSelectedCategory('perks')}
          >
            ⭐ Perks
          </button>
          <button 
            className={selectedCategory === 'mutations' ? 'active' : ''}
            onClick={() => setSelectedCategory('mutations')}
          >
            🧬 Mutations
          </button>
        </div>

        <div className="items-grid">
          {Object.entries(shopItems[selectedCategory]).map(([itemName, item]) => (
            <div 
              key={itemName}
              className={`item-card ${selectedItem === itemName ? 'selected' : ''} ${playerCurrency < item.cost ? 'insufficient-funds' : ''}`}
              onClick={() => setSelectedItem(itemName)}
            >
              <h3>{itemName}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-cost">💰 {item.cost} Currency</div>
              
              {item.mutations && (
                <div className="available-mutations">
                  <h4>Available Mutations:</h4>
                  <div className="mutation-tags">
                    {item.mutations.map(mutation => (
                      <span key={mutation} className="mutation-tag">
                        {mutation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {playerCurrency < item.cost && (
                <div className="insufficient-badge">Insufficient Currency</div>
              )}
            </div>
          ))}
        </div>

        {selectedItem && shopItems[selectedCategory][selectedItem].mutations && (
          <div className="mutation-selector">
            <h3>🧬 Select Mutations for {selectedItem}</h3>
            <p>Choose which mutations to apply (optional):</p>
            <div className="mutation-checkboxes">
              {shopItems[selectedCategory][selectedItem].mutations.map(mutation => (
                <label key={mutation} className="mutation-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMutations.includes(mutation)}
                    onChange={() => handleMutationToggle(mutation)}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  {mutation}
                </label>
              ))}
            </div>
            
            {selectedMutations.length > 0 && (
              <div className="selected-mutations">
                <strong>Selected Mutations:</strong> {selectedMutations.join(', ')}
              </div>
            )}
          </div>
        )}

        <div className="redeem-actions">
          <button 
            className="redeem-button"
            onClick={handleRedemption}
            disabled={!selectedItem || !playerName.trim() || isLoading || playerCurrency < (shopItems[selectedCategory][selectedItem]?.cost || 0)}
          >
            {isLoading ? '🔄 Processing...' : `🛒 Redeem ${selectedItem || 'Item'}`}
          </button>
        </div>

        {redeemStatus && (
          <div className={`redeem-status ${redeemStatus.includes('✅') ? 'success' : redeemStatus.includes('❌') ? 'error' : 'info'}`}>
            {redeemStatus}
          </div>
        )}

        <div className="redeem-info">
          <h3>ℹ️ How Redemption Works</h3>
          <ul>
            <li>Select an item and enter your in-game player name</li>
            <li>Choose mutations for dinosaurs (optional)</li>
            <li>Click redeem - command will be executed on the server</li>
            <li>Your new dinosaur/perk will be applied in-game</li>
            <li>Currency is deducted from your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RedeemPage;