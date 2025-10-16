import React, { useState, useMemo } from 'react';
import { getAllDinosaurs, getDinosaursByCategory, rarityConfig, searchDinosaurs } from '../data/dinosaurDatabase';
import './Shop.css';

function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [userCurrency, setUserCurrency] = useState(25000); // Mock user currency

  const categories = ['all', 'carnivore', 'herbivore', 'aquatic', 'flyer', 'omnivore'];
  const rarities = ['all', 'Apex', 'Legendary', 'Rare', 'Uncommon', 'Common'];
  const sortOptions = ['name', 'price', 'weight', 'rarity'];

  const filteredDinosaurs = useMemo(() => {
    let dinos = selectedCategory === 'all' ? getAllDinosaurs() : getDinosaursByCategory(selectedCategory);
    
    // Filter by rarity
    if (selectedRarity !== 'all') {
      dinos = dinos.filter(dino => dino.rarity === selectedRarity);
    }
    
    // Filter by search query
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      dinos = dinos.filter(dino => 
        dino.name.toLowerCase().includes(searchTerm) ||
        dino.abilities.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort dinosaurs
    dinos.sort((a, b) => {
      switch(sortBy) {
        case 'price':
          return b.price - a.price;
        case 'weight':
          return b.weight - a.weight;
        case 'rarity':
          const rarityOrder = ['Apex', 'Legendary', 'Rare', 'Uncommon', 'Common'];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return dinos;
  }, [selectedCategory, selectedRarity, searchQuery, sortBy]);

  const handlePurchase = (dinosaur) => {
    if (userCurrency >= dinosaur.price) {
      setUserCurrency(prev => prev - dinosaur.price);
      alert(`🦖 Successfully purchased ${dinosaur.name}! Added to your inventory.`);
    } else {
      alert(`❌ Not enough Void Pearls! You need ${dinosaur.price - userCurrency} more.`);
    }
  };

  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}t`;
    }
    return `${weight}kg`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      carnivore: '🦖',
      herbivore: '🌿',
      aquatic: '🌊',
      flyer: '🦅',
      omnivore: '🍃'
    };
    return icons[category.toLowerCase()] || '🦕';
  };

  return (
    <div className="shop">
      <div className="shop-header">
        <h1>🛒 Ashveil Dinosaur Shop</h1>
        <div className="currency-display">
          <span className="currency-amount">💎 {userCurrency.toLocaleString()} Void Pearls</span>
        </div>
      </div>

      <div className="shop-filters">
        <div className="filter-section">
          <label>🔍 Search:</label>
          <input
            type="text"
            placeholder="Search dinosaurs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <label>📂 Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 `${getCategoryIcon(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}s`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <label>⭐ Rarity:</label>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="filter-select"
          >
            {rarities.map(rarity => (
              <option key={rarity} value={rarity}>
                {rarity === 'all' ? 'All Rarities' : rarity}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <label>📊 Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dinosaur-grid">
        {filteredDinosaurs.map(dinosaur => (
          <div 
            key={dinosaur.id} 
            className={`dinosaur-card rarity-${dinosaur.rarity.toLowerCase()}`}
            style={{
              borderColor: rarityConfig[dinosaur.rarity].color,
              boxShadow: rarityConfig[dinosaur.rarity].shadow
            }}
          >
            <div className="dinosaur-header">
              <div className="dinosaur-icon">{dinosaur.icon}</div>
              <div className="dinosaur-info">
                <h3 className="dinosaur-name">{dinosaur.name}</h3>
                <div className="dinosaur-meta">
                  <span className="category-badge">
                    {getCategoryIcon(dinosaur.category)} {dinosaur.category}
                  </span>
                  <span 
                    className="rarity-badge"
                    style={{ 
                      background: rarityConfig[dinosaur.rarity].gradient,
                      color: '#fff'
                    }}
                  >
                    {dinosaur.rarity}
                  </span>
                </div>
              </div>
            </div>

            <div className="dinosaur-stats">
              <div className="stat">
                <span className="stat-label">⚖️ Weight:</span>
                <span className="stat-value">{formatWeight(dinosaur.weight)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">💎 Price:</span>
                <span className="stat-value">{dinosaur.price.toLocaleString()} VP</span>
              </div>
            </div>

            <div className="dinosaur-abilities">
              <h4>🎯 Abilities:</h4>
              <p>{dinosaur.abilities}</p>
            </div>

            <button
              className={`purchase-btn ${userCurrency >= dinosaur.price ? 'can-afford' : 'cannot-afford'}`}
              onClick={() => handlePurchase(dinosaur)}
              disabled={userCurrency < dinosaur.price}
            >
              {userCurrency >= dinosaur.price ? 
                `🛒 Purchase for ${dinosaur.price.toLocaleString()} VP` : 
                `❌ Need ${(dinosaur.price - userCurrency).toLocaleString()} more VP`
              }
            </button>
          </div>
        ))}
      </div>

      {filteredDinosaurs.length === 0 && (
        <div className="no-results">
          <h3>🔍 No dinosaurs found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}

      <div className="shop-footer">
        <p>💡 <strong>Tip:</strong> Use Void Pearls wisely! Apex and Legendary dinosaurs are rare investments.</p>
        <p>🌋 Welcome to Ashveil - Where legends are born!</p>
      </div>
    </div>
  );
}

export default Shop;
