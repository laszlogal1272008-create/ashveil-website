import React, { useState, useMemo } from 'react';
import { getAllDinosaurs, getDinosaursByCategory, rarityConfig } from '../data/dinosaurDatabase';
import { useCurrency } from '../contexts/CurrencyContext';
import './Shop.css';

function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { currencies, spendCurrency, canAfford } = useCurrency();

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
    const currency = 'Void Pearls'; // All dinosaurs now use Void Pearls
    
    if (canAfford(currency, dinosaur.price)) {
      spendCurrency(currency, dinosaur.price);
      alert(`Successfully purchased ${dinosaur.name}! Added to your inventory.`);
    } else {
      const userAmount = currencies[currency];
      alert(`Insufficient ${currency}! You need ${dinosaur.price - userAmount} more.`);
    }
  };

  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)}t`;
    }
    return `${weight}kg`;
  };

  return (
    <div className="shop">
      <div className="shop-header">
        <div className="shop-title-section">
          <h1>Ashveil Dinosaur Shop</h1>
          <div className="membership-badge">
            💎 PREMIUM MEMBERSHIP STORE
          </div>
        </div>
        <div className="currency-display">
          <span className="currency-amount">{currencies['Void Pearls'].toLocaleString()} Void Pearls</span>
        </div>
      </div>

      <div className="shop-filters">
        <div className="filter-section">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search dinosaurs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <label>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : 
                 `${category.charAt(0).toUpperCase() + category.slice(1)}s`}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <label>Rarity:</label>
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
          <label>Sort by:</label>
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
              <h3 className="dinosaur-name">{dinosaur.name}</h3>
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

            <div className="dinosaur-meta">
              <p><strong>Species:</strong> {dinosaur.name}</p>
              <p><strong>Weight:</strong> {formatWeight(dinosaur.weight)}</p>
              <p><strong>Category:</strong> {dinosaur.category}</p>
            </div>

            <div className="dinosaur-abilities">
              <p><strong>Abilities:</strong> {dinosaur.abilities}</p>
            </div>

            <div className="price-section">
              <div className="price">
                <span className="currency-icon">💎</span>
                <span className="price-amount">{dinosaur.price.toLocaleString()} Void Pearls</span>
              </div>
              <button
                className={`purchase-btn ${canAfford('Void Pearls', dinosaur.price) ? 'can-afford' : 'cannot-afford'}`}
                onClick={() => handlePurchase(dinosaur)}
                disabled={!canAfford('Void Pearls', dinosaur.price)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDinosaurs.length === 0 && (
        <div className="no-results">
          <h3>No dinosaurs found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      )}

      <div className="shop-footer">
        <p><strong>Tip:</strong> All dinosaurs are now available with Void Pearls - the exclusive membership currency!</p>
        <p><strong>Membership Benefits:</strong> Access to the complete Ashveil dinosaur collection.</p>
        <p>Welcome to Ashveil - Where legends are born!</p>
      </div>
    </div>
  );
}

export default Shop;
