import React, { useState } from 'react';
import './Market.css';

function Market() {
  const [activeTab, setActiveTab] = useState('dinosaurs');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('price-low');

  // Mock market data
  const marketDinosaurs = [
    {
      id: 1,
      name: 'Alpha Tyrannosaurus',
      species: 'Tyrannosaurus',
      rarity: 'legendary',
      price: 2500,
      currency: 'carnivore',
      seller: 'DinoHunter23',
      mutations: ['Size+', 'Strength+', 'Alpha']
    },
    {
      id: 2,
      name: 'Swift Omniraptor',
      species: 'Omniraptor',
      rarity: 'rare',
      price: 800,
      currency: 'carnivore',
      seller: 'RaptorKing',
      mutations: ['Speed+', 'Pack Hunter']
    },
    {
      id: 3,
      name: 'Gentle Maiasaura',
      species: 'Maiasaura',
      rarity: 'epic',
      price: 1500,
      currency: 'herbivore',
      seller: 'PlantEater42',
      mutations: ['Size+', 'Healing+']
    },
    {
      id: 4,
      name: 'Armored Triceratops',
      species: 'Triceratops',
      rarity: 'epic',
      price: 1200,
      currency: 'herbivore',
      seller: 'HornedWarrior',
      mutations: ['Defense+', 'Charge Attack']
    }
  ];

  const marketSkins = [
    {
      id: 101,
      name: 'Volcanic Scales',
      species: 'Tyrannosaurus',
      rarity: 'legendary',
      price: 500,
      currency: 'carnivore',
      seller: 'SkinCollector',
      preview: 'Red/Orange gradient with glowing embers'
    },
    {
      id: 102,
      name: 'Forest Camouflage',
      species: 'Omniraptor',
      rarity: 'rare',
      price: 250,
      currency: 'carnivore',
      seller: 'CamoMaster',
      preview: 'Green/Brown woodland pattern'
    },
    {
      id: 103,
      name: 'Crystal Armor',
      species: 'Triceratops',
      rarity: 'epic',
      price: 400,
      currency: 'herbivore',
      seller: 'CrystalCrafter',
      preview: 'Translucent blue crystal texture'
    }
  ];

  const filteredDinosaurs = marketDinosaurs.filter(dino => {
    if (filterType === 'all') return true;
    if (filterType === 'carnivore') return dino.currency === 'carnivore';
    if (filterType === 'herbivore') return dino.currency === 'herbivore';
    return dino.rarity === filterType;
  });

  const filteredSkins = marketSkins.filter(skin => {
    if (filterType === 'all') return true;
    if (filterType === 'carnivore') return skin.currency === 'carnivore';
    if (filterType === 'herbivore') return skin.currency === 'herbivore';
    return skin.rarity === filterType;
  });

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return '#FFD700';
      case 'epic': return '#9D4EDD';
      case 'rare': return '#0EA5E9';
      case 'common': return '#6B7280';
      default: return '#6B7280';
    }
  };

  return (
    <div className="market-page">
      <div className="market-header">
        <h1>Dinosaur Market</h1>
        <p>Trade dinosaurs and skins with other players</p>
        
        <div className="currency-display">
          <div className="currency-item">
            <span className="currency-icon">🗡️</span>
            <span className="currency-amount">1,250</span>
            <span className="currency-label">Razor Talons</span>
          </div>
          <div className="currency-item">
            <span className="currency-icon">🌿</span>
            <span className="currency-amount">2,100</span>
            <span className="currency-label">Sylvan Shards</span>
          </div>
        </div>
      </div>

      <div className="market-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dinosaurs' ? 'active' : ''}`}
          onClick={() => setActiveTab('dinosaurs')}
        >
          🦕 Dinosaurs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'skins' ? 'active' : ''}`}
          onClick={() => setActiveTab('skins')}
        >
          🎨 Skins
        </button>
        <button 
          className={`tab-btn ${activeTab === 'my-listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-listings')}
        >
          📋 My Listings
        </button>
      </div>

      <div className="market-controls">
        <div className="filter-section">
          <label>Filter:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Items</option>
            <option value="carnivore">Razor Talons</option>
            <option value="herbivore">Sylvan Shards</option>
            <option value="legendary">Legendary</option>
            <option value="epic">Epic</option>
            <option value="rare">Rare</option>
            <option value="common">Common</option>
          </select>
        </div>
        
        <div className="sort-section">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rarity">Rarity</option>
            <option value="recent">Recently Listed</option>
          </select>
        </div>
      </div>

      <div className="market-content">
        {activeTab === 'dinosaurs' && (
          <div className="market-grid">
            {filteredDinosaurs.map(dino => (
              <div key={dino.id} className="market-card dino-card">
                <div className="card-header">
                  <h3 className="dino-name" style={{color: getRarityColor(dino.rarity)}}>
                    {dino.name}
                  </h3>
                  <div className="rarity-badge" style={{backgroundColor: getRarityColor(dino.rarity)}}>
                    {dino.rarity}
                  </div>
                </div>
                
                <div className="dino-info">
                  <p><strong>Species:</strong> {dino.species}</p>
                  <p><strong>Seller:</strong> {dino.seller}</p>
                </div>

                <div className="mutations">
                  <strong>Mutations:</strong>
                  <div className="mutation-tags">
                    {dino.mutations.map((mutation, index) => (
                      <span key={index} className="mutation-tag">{mutation}</span>
                    ))}
                  </div>
                </div>

                <div className="price-section">
                  <div className="price">
                    <span className="currency-icon">
                      {dino.currency === 'carnivore' ? '🗡️' : '🌿'}
                    </span>
                    <span className="price-amount">{dino.price.toLocaleString()}</span>
                  </div>
                  <button className="buy-btn">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skins' && (
          <div className="market-grid">
            {filteredSkins.map(skin => (
              <div key={skin.id} className="market-card skin-card">
                <div className="card-header">
                  <h3 className="skin-name" style={{color: getRarityColor(skin.rarity)}}>
                    {skin.name}
                  </h3>
                  <div className="rarity-badge" style={{backgroundColor: getRarityColor(skin.rarity)}}>
                    {skin.rarity}
                  </div>
                </div>

                <div className="skin-info">
                  <p><strong>For:</strong> {skin.species}</p>
                  <p><strong>Seller:</strong> {skin.seller}</p>
                  <p><strong>Preview:</strong> {skin.preview}</p>
                </div>

                <div className="price-section">
                  <div className="price">
                    <span className="currency-icon">
                      {skin.currency === 'carnivore' ? '🥩' : '🌿'}
                    </span>
                    <span className="price-amount">{skin.price.toLocaleString()}</span>
                  </div>
                  <button className="buy-btn">Buy Now</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my-listings' && (
          <div className="my-listings">
            <div className="listing-actions">
              <button className="sell-btn">+ Sell Dinosaur</button>
              <button className="sell-btn">+ Sell Skin</button>
            </div>
            <div className="empty-state">
              <p>You haven't listed anything for sale yet.</p>
              <p>Start selling your dinosaurs and skins to earn currency!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Market;
