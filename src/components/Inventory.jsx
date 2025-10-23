import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rarityConfig } from '../data/dinosaurDatabase';
import './Inventory.css';

function Inventory() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [currentTheme, setCurrentTheme] = useState('dusk'); // Default to beautiful dusk theme

  // Time-based theme system to showcase in-game time
  useEffect(() => {
    const updateThemeBasedOnTime = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 10) {
        setCurrentTheme('dawn'); // 5 AM - 10 AM: Dawn theme
      } else if (hour >= 10 && hour < 17) {
        setCurrentTheme('day'); // 10 AM - 5 PM: Day theme  
      } else if (hour >= 17 && hour < 21) {
        setCurrentTheme('dusk'); // 5 PM - 9 PM: Dusk theme (beautiful purple!)
      } else {
        setCurrentTheme('night'); // 9 PM - 5 AM: Night theme
      }
    };

    updateThemeBasedOnTime();
    const interval = setInterval(updateThemeBasedOnTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Mock inventory data - this would come from your game state/database
  const mockInventory = [
    {
      id: 'inv-1',
      dinosaurId: 'tyrannosaurus',
      name: 'Tyrannosaurus',
      mutations: ['Cellular Regeneration', 'Enhanced Digestion', 'Reinforced Tendons'],
      source: 'grown', // grown, shop, marketplace
      acquiredDate: '2024-10-10',
      playTime: '12h 45m',
      kills: 23,
      deaths: 2,
      weight: 8000,
      rarity: 'Apex',
      category: 'Carnivore'
    },
    {
      id: 'inv-2',
      dinosaurId: 'allosaurus',
      name: 'Allosaurus',
      mutations: ['Nocturnal'],
      source: 'shop',
      acquiredDate: '2024-10-12',
      playTime: '6h 20m',
      kills: 15,
      deaths: 1,
      weight: 2000,
      rarity: 'Legendary',
      category: 'Carnivore'
    },
    {
      id: 'inv-3',
      dinosaurId: 'triceratops',
      name: 'Triceratops',
      mutations: ['Osteosclerosis', 'Thick Hide'],
      source: 'marketplace',
      acquiredDate: '2024-10-08',
      playTime: '18h 15m',
      kills: 8,
      deaths: 0,
      weight: 9000,
      rarity: 'Apex',
      category: 'Herbivore'
    },
    {
      id: 'inv-4',
      dinosaurId: 'carnotaurus',
      name: 'Carnotaurus',
      mutations: ['Featherweight'],
      source: 'grown',
      acquiredDate: '2024-10-14',
      playTime: '3h 30m',
      kills: 7,
      deaths: 3,
      weight: 1500,
      rarity: 'Rare',
      category: 'Carnivore'
    },
    {
      id: 'inv-5',
      dinosaurId: 'stegosaurus',
      name: 'Stegosaurus',
      mutations: ['Photosynthetic Tissue', 'Sustained Hydration'],
      source: 'shop',
      acquiredDate: '2024-10-06',
      playTime: '14h 50m',
      kills: 2,
      deaths: 1,
      weight: 5000,
      rarity: 'Legendary',
      category: 'Herbivore'
    }
  ];

  const filteredAndSortedInventory = useMemo(() => {
    let filtered = mockInventory;

    // Filter by category/source
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'carnivores' || selectedFilter === 'herbivores') {
        filtered = filtered.filter(dino => 
          selectedFilter === 'carnivores' ? dino.category === 'Carnivore' : dino.category === 'Herbivore'
        );
      } else {
        filtered = filtered.filter(dino => dino.source === selectedFilter);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Legendary': 4, 'Apex': 5 };
          return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
        case 'playTime':
          return parseFloat(b.playTime) - parseFloat(a.playTime);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [selectedFilter, sortBy]);

  const getSourceIcon = (source) => {
    switch (source) {
      case 'grown': return '🌱';
      case 'shop': return '🏪';
      case 'marketplace': return '🏛️';
      default: return '❓';
    }
  };

  const getRarityColor = (rarity) => {
    return rarityConfig[rarity]?.color || '#9CA3AF';
  };

  const getRarityBorder = (rarity) => {
    return rarityConfig[rarity]?.border || '2px solid #666';
  };

  const getRarityShadow = (rarity) => {
    return rarityConfig[rarity]?.shadow || '0 4px 15px rgba(0, 0, 0, 0.3)';
  };

  return (
    <div className={`inventory-page ${currentTheme}-theme`}>
      <div className={`inventory-header ${currentTheme}-theme`}>
        <h1>Dinosaur Inventory</h1>
        <p>Manage your collection of dinosaurs from growing, shopping, and trading</p>
        <div className="inventory-stats">
          <div className={`stat-card ${currentTheme}-theme`}>
            <span className={`stat-number ${currentTheme}-theme`}>{mockInventory.length}</span>
            <span className={`stat-label ${currentTheme}-theme`}>Total Dinosaurs</span>
          </div>
          <div className={`stat-card ${currentTheme}-theme`}>
            <span className={`stat-number ${currentTheme}-theme`}>{mockInventory.filter(d => d.source === 'grown').length}</span>
            <span className={`stat-label ${currentTheme}-theme`}>Grown</span>
          </div>
          <div className={`stat-card ${currentTheme}-theme`}>
            <span className={`stat-number ${currentTheme}-theme`}>{mockInventory.filter(d => d.source === 'shop').length}</span>
            <span className={`stat-label ${currentTheme}-theme`}>Purchased</span>
          </div>
          <div className={`stat-card ${currentTheme}-theme`}>
            <span className={`stat-number ${currentTheme}-theme`}>{mockInventory.filter(d => d.source === 'marketplace').length}</span>
            <span className={`stat-label ${currentTheme}-theme`}>Traded</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls">
        <div className="filter-section">
          <label>Filter:</label>
          <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
            <option value="all">All Dinosaurs</option>
            <option value="carnivores">Carnivores</option>
            <option value="herbivores">Herbivores</option>
            <option value="grown">Grown In-Game</option>
            <option value="shop">Bought from Shop</option>
            <option value="marketplace">From Marketplace</option>
          </select>
        </div>

        <div className="sort-section">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="rarity">Rarity</option>
            <option value="playTime">Play Time</option>
          </select>
        </div>

        <div className="view-section">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      <div className={`inventory-grid ${viewMode}`}>
        {filteredAndSortedInventory.map(dinosaur => (
          <div 
            key={dinosaur.id} 
            className="dinosaur-card"
            style={{
              border: getRarityBorder(dinosaur.rarity),
              boxShadow: getRarityShadow(dinosaur.rarity)
            }}
          >
            <div className="dino-header">
              <div className="dino-name">
                <h3>{dinosaur.name}</h3>
                <span className="dino-species">{dinosaur.category}</span>
              </div>
              <div className="dino-source">
                <span className="source-icon">{getSourceIcon(dinosaur.source)}</span>
                <span className="source-text">{dinosaur.source}</span>
              </div>
            </div>

            <div className="dino-stats">
              <div className="stat-row">
                <span className="stat-label">Rarity:</span>
                <span 
                  className="rarity-badge"
                  style={{ color: getRarityColor(dinosaur.rarity) }}
                >
                  {dinosaur.rarity}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Weight:</span>
                <span className="stat-value">{dinosaur.weight} kg</span>
              </div>
            </div>

            <div className="dino-performance">
              <div className="perf-stat">
                <span className="perf-label">Play Time:</span>
                <span className="perf-value">{dinosaur.playTime}</span>
              </div>
              <div className="perf-stat">
                <span className="perf-label">K/D Ratio:</span>
                <span className="perf-value">{dinosaur.kills}/{dinosaur.deaths}</span>
              </div>
            </div>

            <div className="dino-actions">
              <Link 
                to="/redeem" 
                state={{ selectedDinosaur: dinosaur }}
                className="action-btn redeem-btn"
              >
                Redeem
              </Link>
              <button className="action-btn manage-btn">
                Manage
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedInventory.length === 0 && (
        <div className="empty-inventory">
          <h3>No dinosaurs found</h3>
          <p>Try adjusting your filters or visit the shop to acquire new dinosaurs!</p>
          <Link to="/shop" className="shop-link">
            Visit Shop
          </Link>
        </div>
      )}
    </div>
  );
}

export default Inventory;
