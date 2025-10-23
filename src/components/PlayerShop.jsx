import React, { useState, useEffect } from 'react';
import './PlayerShop.css';

const PlayerShop = () => {
  const [playerName, setPlayerName] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [shopItems, setShopItems] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('dinosaurs');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Fetch shop items
  const fetchShopItems = async () => {
    try {
      const response = await fetch('/api/shop/items');
      const data = await response.json();
      
      if (data.success) {
        setShopItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching shop items:', error);
    }
  };

  // Fetch player data
  const fetchPlayerData = async (name) => {
    if (!name) return;
    
    try {
      const response = await fetch(`/api/player/${encodeURIComponent(name)}/data`);
      const data = await response.json();
      
      if (data.success) {
        setPlayerData(data.data);
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  useEffect(() => {
    fetchShopItems();
  }, []);

  useEffect(() => {
    if (playerName) {
      fetchPlayerData(playerName);
    }
  }, [playerName]);

  const handleRedeem = async (category, itemName, customOptions = {}) => {
    if (!playerName) {
      setResponseMessage('❌ Please enter your player name');
      return;
    }

    setLoading(true);
    setResponseMessage('');

    try {
      // First, process the shop purchase normally
      const shopResponse = await fetch('/api/shop/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName,
          category,
          itemName,
          customOptions
        }),
      });

      const shopData = await shopResponse.json();

      if (shopData.success) {
        // Now execute the command automatically using the new automation system
        const executionResponse = await fetch('/api/automation/execute-command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: shopData.command,
            playerId: playerName,
            type: 'shop',
            playerData: {
              currency: shopData.remainingCurrency
            }
          }),
        });

        const executionData = await executionResponse.json();

        if (executionData.success) {
          if (executionData.automaticExecution) {
            setResponseMessage(`✅ ${itemName} activated instantly! ${shopData.command} executed automatically. Remaining currency: ${shopData.remainingCurrency}`);
          } else {
            setResponseMessage(`✅ Successfully redeemed ${itemName}! Command executed via backup system. Remaining currency: ${shopData.remainingCurrency}`);
          }
        } else {
          setResponseMessage(`✅ Purchase successful! ${itemName} will be activated shortly. Remaining currency: ${shopData.remainingCurrency}`);
        }
        
        fetchPlayerData(playerName); // Refresh player data
      } else {
        setResponseMessage(`❌ ${shopData.error}`);
      }
    } catch (error) {
      setResponseMessage(`❌ Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMessageRedeem = () => {
    if (!customMessage) {
      setResponseMessage('❌ Please enter a custom message');
      return;
    }
    handleRedeem('perks', 'Custom Message', { message: customMessage });
  };

  const renderShopCategory = (category, items) => {
    if (!items) return null;

    return (
      <div className="shop-category">
        {Object.entries(items).map(([itemName, itemData]) => (
          <div key={itemName} className="shop-item">
            <div className="item-header">
              <h4>{itemName}</h4>
              <span className="item-cost">💎 {itemData.cost}</span>
            </div>
            <div className="item-description">
              {category === 'dinosaurs' && `Transform into a ${itemName}`}
              {category === 'perks' && getPerksDescription(itemName)}
              {category === 'weather' && `Change server weather to ${itemName}`}
            </div>
            <button
              onClick={() => {
                if (itemName === 'Custom Message') {
                  handleCustomMessageRedeem();
                } else {
                  handleRedeem(category, itemName);
                }
              }}
              disabled={loading || !playerData || playerData.currency < itemData.cost}
              className="redeem-btn"
            >
              {loading ? 'Processing...' : 'Redeem'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const getPerksDescription = (perkName) => {
    switch (perkName) {
      case 'Full Heal':
        return 'Instantly heal your dinosaur to full health';
      case 'Adult Growth':
        return 'Instantly grow your dinosaur to adult size';
      case 'Half Growth':
        return 'Grow your dinosaur to 50% size';
      case 'Custom Message':
        return 'Send yourself a custom message in-game';
      default:
        return 'Special perk for your dinosaur';
    }
  };

  return (
    <div className="player-shop">
      <div className="shop-header">
        <h2>🛒 Ashveil Shop</h2>
        <p>Spend your currency on dinosaurs, perks, and server changes!</p>
      </div>

      <div className="player-section">
        <h3>Player Information</h3>
        <input
          type="text"
          placeholder="Enter your in-game player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="player-input"
        />
        
        {playerData && (
          <div className="player-stats">
            <div className="stat-item">
              <span className="stat-label">💎 Currency:</span>
              <span className="stat-value">{playerData.currency}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">🛍️ Total Purchases:</span>
              <span className="stat-value">{playerData.purchases.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">💰 Total Spent:</span>
              <span className="stat-value">{playerData.totalSpent}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">📅 Member Since:</span>
              <span className="stat-value">{new Date(playerData.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="shop-navigation">
        <button
          onClick={() => setSelectedCategory('dinosaurs')}
          className={`nav-btn ${selectedCategory === 'dinosaurs' ? 'active' : ''}`}
        >
          🦕 Dinosaurs
        </button>
        <button
          onClick={() => setSelectedCategory('perks')}
          className={`nav-btn ${selectedCategory === 'perks' ? 'active' : ''}`}
        >
          ⭐ Perks
        </button>
        <button
          onClick={() => setSelectedCategory('weather')}
          className={`nav-btn ${selectedCategory === 'weather' ? 'active' : ''}`}
        >
          🌦️ Weather
        </button>
      </div>

      {selectedCategory === 'perks' && (
        <div className="custom-message-section">
          <h4>Custom Message</h4>
          <input
            type="text"
            placeholder="Enter your custom message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="message-input"
            maxLength={100}
          />
        </div>
      )}

      <div className="shop-content">
        {shopItems && renderShopCategory(selectedCategory, shopItems[selectedCategory])}
      </div>

      {responseMessage && (
        <div className="response-message">
          {responseMessage}
        </div>
      )}

      <div className="instructions">
        <h3>📋 How it Works</h3>
        <ol>
          <li>Enter your exact in-game player name</li>
          <li>Browse available items in different categories</li>
          <li>Click "Redeem" to purchase items with your currency</li>
          <li>Commands will be queued for execution in the server console</li>
          <li>Your items/changes will be applied in-game shortly</li>
        </ol>
        
        <div className="note">
          <strong>Note:</strong> All purchases are processed through the server console. 
          There may be a short delay before changes appear in-game.
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Processing purchase...</div>
        </div>
      )}
    </div>
  );
};

export default PlayerShop;