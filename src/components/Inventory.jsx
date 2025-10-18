import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { dinosaurDatabase } from '../data/dinosaurDatabase';
import './Inventory.css';

function Inventory() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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
      rarity: 'Epic',
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
      rarity: 'Rare',
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
          const rarityOrder = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4, 'Apex': 5 };
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
    switch (rarity) {
      case 'Common': return '#9CA3AF';
      case 'Rare': return '#60A5FA';
      case 'Epic': return '#A855F7';
      case 'Legendary': return '#F59E0B';
      case 'Apex': return '#EF4444';
      default: return '#9CA3AF';
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Dinosaur Inventory</h1>
        <p>Manage your collection of dinosaurs from growing, shopping, and trading</p>
        <div className="inventory-stats">
          <div className="stat-card">
            <span className="stat-number">{mockInventory.length}</span>
            <span className="stat-label">Total Dinosaurs</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{mockInventory.filter(d => d.source === 'grown').length}</span>
            <span className="stat-label">Grown</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{mockInventory.filter(d => d.source === 'shop').length}</span>
            <span className="stat-label">Purchased</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{mockInventory.filter(d => d.source === 'marketplace').length}</span>
            <span className="stat-label">Traded</span>
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
          <div key={dinosaur.id} className="dinosaur-card">
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

            <div className="dino-mutations">
              <h4>Mutations ({dinosaur.mutations.length})</h4>
              <div className="mutations-list">
                {dinosaur.mutations.map((mutation, index) => (
                  <span key={index} className="mutation-tag">
                    {mutation}
                  </span>
                ))}
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
