// ================================================
// VOID PEARL SHOP - PREMIUM DINOSAUR MARKETPLACE
// ================================================
// This component provides:
// - Complete Void Pearl dinosaur shop interface
// - Real-time currency balance updates
// - Advanced filtering and search capabilities
// - Purchase confirmation and processing
// - Integration with backend API for purchases
// - User authentication and membership status
// - Responsive design for all devices
// ================================================

import React, { useState, useEffect, useMemo } from 'react';
import { getAllDinosaurs, getDinosaursByCategory, rarityConfig } from '../data/dinosaurDatabase';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import './VoidPearlShop.css';

const VoidPearlShop = () => {
    // ================================================
    // STATE MANAGEMENT
    // ================================================
    
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRarity, setSelectedRarity] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    
    // User and purchase states
    const [membershipStatus, setMembershipStatus] = useState('inactive');
    const [confirmingPurchase, setConfirmingPurchase] = useState(null);
    const [processingPurchase, setProcessingPurchase] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    
    const { currencies, spendCurrency, canAfford, refreshCurrencies } = useCurrency();
    const { user, isAuthenticated, getSteamId } = useAuth();
    
    // Filter and sort options
    const categories = ['all', 'carnivore', 'herbivore', 'aquatic', 'flyer', 'omnivore'];
    const rarities = ['all', 'Apex', 'Legendary', 'Rare', 'Uncommon', 'Common'];
    const sortOptions = [
        { value: 'name', label: 'Name' },
        { value: 'price', label: 'Void Pearls' },
        { value: 'weight', label: 'Weight' },
        { value: 'rarity', label: 'Rarity' },
        { value: 'newest', label: 'Newest' }
    ];

    
    // ================================================
    // EFFECTS & DATA LOADING
    // ================================================
    
    const [shopDinosaurs, setShopDinosaurs] = useState([]);
    
    useEffect(() => {
        loadShopInventory();
        loadUserData();
        loadPurchaseHistory();
        loadFavorites();
    }, []);
    
    useEffect(() => {
        // Refresh currency balance every 30 seconds
        const interval = setInterval(() => {
            refreshCurrencies();
        }, 30000);
        
        return () => clearInterval(interval);
    }, [refreshCurrencies]);
    
    const loadShopInventory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/shop/dinosaurs');
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setShopDinosaurs(result.data);
                } else {
                    // Fallback to static data if API fails
                    setShopDinosaurs(getAllDinosaurs());
                }
            } else {
                // Fallback to static data if API fails
                setShopDinosaurs(getAllDinosaurs());
            }
        } catch (error) {
            console.error('Failed to load shop inventory:', error);
            // Fallback to static data if API fails
            setShopDinosaurs(getAllDinosaurs());
        } finally {
            setLoading(false);
        }
    };
    
    const loadUserData = async () => {
        try {
            const steamId = getSteamId();
            if (!steamId || !isAuthenticated) {
                console.log('No Steam ID available, user not logged in');
                return;
            }
            
            const response = await fetch(`/api/user/profile/${steamId}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setUserProfile(result.data.profile);
                    setMembershipStatus(result.data.profile.membershipTier || 'none');
                    
                    // Update currency context with latest balance
                    if (refreshCurrencies) {
                        refreshCurrencies();
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    };
    
    const loadPurchaseHistory = async () => {
        try {
            const response = await fetch('/api/shop/history', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const history = await response.json();
                setPurchaseHistory(history);
            }
        } catch (error) {
            console.error('Failed to load purchase history:', error);
        }
    };
    
    const loadFavorites = () => {
        const savedFavorites = localStorage.getItem('ashveil_favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }
    };

    
    // ================================================
    // FILTERING & SORTING LOGIC
    // ================================================
    
    const filteredDinosaurs = useMemo(() => {
        let dinos = [...shopDinosaurs];
        
        // Filter by category
        if (selectedCategory !== 'all') {
            dinos = dinos.filter(dino => dino.category === selectedCategory);
        }
        
        // Filter by rarity
        if (selectedRarity !== 'all') {
            dinos = dinos.filter(dino => dino.rarity === selectedRarity);
        }
        
        // Filter by search query
        if (searchQuery) {
            const searchTerm = searchQuery.toLowerCase();
            dinos = dinos.filter(dino => 
                dino.species_name.toLowerCase().includes(searchTerm) ||
                (dino.abilities && dino.abilities.toLowerCase().includes(searchTerm)) ||
                dino.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filter by membership status (premium only dinosaurs)
        if (membershipStatus === 'none') {
            dinos = dinos.filter(dino => !dino.requires_membership);
        }
        
        // Sort dinosaurs
        dinos.sort((a, b) => {
            let comparison = 0;
            
            switch(sortBy) {
                case 'price':
                    comparison = a.void_pearl_cost - b.void_pearl_cost;
                    break;
                case 'weight':
                    comparison = a.max_weight - b.max_weight;
                    break;
                case 'rarity':
                    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Apex'];
                    comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
                    break;
                case 'newest':
                    comparison = new Date(b.created_at || '2023-01-01') - new Date(a.created_at || '2023-01-01');
                    break;
                default:
                    comparison = a.species_name.localeCompare(b.species_name);
            }
            
            return sortOrder === 'desc' ? -comparison : comparison;
        });
        
        return dinos;
    }, [shopDinosaurs, selectedCategory, selectedRarity, searchQuery, sortBy, sortOrder, membershipStatus]);
    
    // ================================================
    // PURCHASE HANDLING
    // ================================================
    
    const handlePurchaseClick = (dinosaur) => {
        if (!isAuthenticated) {
            setError('Please log in to make purchases');
            return;
        }
        
        if (!canAfford('Void Pearls', dinosaur.price)) {
            const userAmount = currencies['Void Pearls'];
            setError(`Insufficient Void Pearls! You need ${dinosaur.price - userAmount} more.`);
            return;
        }
        
        setConfirmingPurchase(dinosaur);
    };
    
    const confirmPurchase = async (dinosaur) => {
        setProcessingPurchase(true);
        setError(null);
        
        try {
            const steamId = getSteamId();
            if (!steamId || !isAuthenticated) {
                setError('Please log in to make purchases');
                return;
            }
            
            // Get player name from user input or profile
            const playerName = userProfile?.username || user?.displayName || prompt('Enter your in-game character name:');
            if (!playerName) {
                setError('Player name is required for delivery');
                setProcessingPurchase(false);
                return;
            }
            
            const response = await fetch('/api/shop/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId: steamId,
                    dinosaurId: dinosaur.id,
                    playerName: playerName
                })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Update local currency balance
                spendCurrency('Void Pearls', result.data.cost);
                
                // Show success message with delivery status
                setError(null);
                const deliveryMessage = result.data.deliveryStatus === 'delivered' 
                    ? `🦕 Successfully purchased and delivered ${result.data.dinosaur}! Check your character in-game.`
                    : `⚠️ Purchased ${result.data.dinosaur} but delivery failed. Contact support with this info: ${result.data.rconResponse}`;
                
                alert(deliveryMessage);
                
                // Refresh purchase history and user profile
                loadPurchaseHistory();
                loadUserData();
                
                // Close confirmation dialog
                setConfirmingPurchase(null);
                
            } else {
                throw new Error(result.error || 'Purchase failed');
            }
            
        } catch (error) {
            console.error('Purchase failed:', error);
            setError(`Purchase failed: ${error.message}`);
        } finally {
            setProcessingPurchase(false);
        }
    };
    
    const cancelPurchase = () => {
        setConfirmingPurchase(null);
    };

    
    // ================================================
    // UTILITY FUNCTIONS
    // ================================================
    
    const formatWeight = (weight) => {
        if (weight >= 1000) {
            return `${(weight / 1000).toFixed(1)}t`;
        }
        return `${weight}kg`;
    };
    
    const formatPrice = (price) => {
        return price.toLocaleString();
    };
    
    const toggleFavorite = (dinosaurId) => {
        const newFavorites = favorites.includes(dinosaurId)
            ? favorites.filter(id => id !== dinosaurId)
            : [...favorites, dinosaurId];
        
        setFavorites(newFavorites);
        localStorage.setItem('ashveil_favorites', JSON.stringify(newFavorites));
    };
    
    const hasPurchased = (dinosaurId) => {
        return purchaseHistory.some(purchase => purchase.species_id === dinosaurId);
    };
    
    const getMembershipBadge = () => {
        if (membershipStatus === 'active') {
            return (
                <div className="membership-badge premium">
                    <span className="badge-icon">👑</span>
                    <span className="badge-text">PREMIUM MEMBER</span>
                </div>
            );
        }
        
        return (
            <div className="membership-badge free">
                <span className="badge-icon">⭐</span>
                <span className="badge-text">FREE MEMBER</span>
            </div>
        );
    };

    
    // ================================================
    // MAIN RENDER
    // ================================================
    
    if (loading) {
        return (
            <div className="void-pearl-shop loading">
                <div className="loading-spinner">⏳</div>
                <p>Loading Ashveil Dinosaur Shop...</p>
            </div>
        );
    }
    
    return (
        <div className="void-pearl-shop">
            {/* Header Section */}
            <div className="shop-header">
                <div className="shop-title-section">
                    <h1>Void Pearl Dinosaur Shop</h1>
                    <p className="shop-subtitle">Premium Dinosaur Marketplace for Ashveil Members</p>
                    {getMembershipBadge()}
                </div>
                
                <div className="shop-status">
                    <div className="currency-display">
                        <span className="currency-icon">💎</span>
                        <span className="currency-amount">{formatPrice(currencies['Void Pearls'] || 0)} Void Pearls</span>
                        <button 
                            className="refresh-btn"
                            onClick={refreshCurrencies}
                            title="Refresh Balance"
                        >
                            🔄
                        </button>
                    </div>
                    
                    <div className="shop-stats">
                        <div className="stat">
                            <span className="stat-label">Available:</span>
                            <span className="stat-value">{filteredDinosaurs.length}</span>
                        </div>
                        <div className="stat">
                            <span className="stat-label">Owned:</span>
                            <span className="stat-value">{purchaseHistory.length}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Error Display */}
            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{error}</span>
                    <button 
                        className="error-close"
                        onClick={() => setError(null)}
                    >
                        ✕
                    </button>
                </div>
            )}
            
            {/* Membership Info */}
            <div className="membership-info">
                <h3>💰 Get More Void Pearls!</h3>
                <p>Support Ashveil on Patreon to receive monthly Void Pearls:</p>
                <div className="patreon-tiers">
                    <div className="tier">
                        <strong>Supporter - $5/month:</strong> 500 VP + Discord Access
                    </div>
                    <div className="tier">
                        <strong>Champion - $10/month:</strong> 1,200 VP + Priority Support
                    </div>
                    <div className="tier">
                        <strong>Legend - $20/month:</strong> 2,500 VP + All Perks + Early Access
                    </div>
                </div>
                <a href="https://patreon.com/ashveil" target="_blank" rel="noopener noreferrer" className="patreon-btn">
                    🧡 Support on Patreon
                </a>
            </div>
            
            {/* Filter Controls */}
            <div className="filter-controls">
                <button 
                    className={`filter-toggle ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="filter-icon">🔍</span>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                
                <div className="quick-stats">
                    <span>{filteredDinosaurs.length} dinosaurs found</span>
                </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
                <div className="shop-filters">
                    <div className="filter-row">
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
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Main Content */}
            <div className="dinosaur-container">
                {filteredDinosaurs.length === 0 ? (
                    <div className="no-results">
                        <div className="no-results-icon">🦕</div>
                        <h3>No dinosaurs found</h3>
                        <p>Try adjusting your filters or search terms.</p>
                        {membershipStatus === 'inactive' && (
                            <div className="upgrade-prompt">
                                <p><strong>Want access to premium dinosaurs?</strong></p>
                                <button className="upgrade-btn">
                                    👑 Upgrade to Premium
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="dinosaur-grid">
                        {filteredDinosaurs.map(dinosaur => {
                            const isPurchased = hasPurchased(dinosaur.id);
                            const isFavorite = favorites.includes(dinosaur.id);
                            const canBuy = canAfford('Void Pearls', dinosaur.price) && !isPurchased;
                            const isAvailable = membershipStatus === 'active' || !dinosaur.isPremiumOnly;
                            
                            return (
                                <div 
                                    key={dinosaur.id} 
                                    className={`dinosaur-card rarity-${dinosaur.rarity.toLowerCase()} ${!isAvailable ? 'premium-locked' : ''}`}
                                    style={{
                                        borderColor: rarityConfig[dinosaur.rarity]?.color,
                                        boxShadow: rarityConfig[dinosaur.rarity]?.shadow
                                    }}
                                >
                                    {/* Premium Lock Overlay */}
                                    {!isAvailable && (
                                        <div className="premium-lock-overlay">
                                            <div className="lock-icon">🔒</div>
                                            <div className="lock-text">Premium Only</div>
                                        </div>
                                    )}
                                    
                                    {/* Purchased Badge */}
                                    {isPurchased && (
                                        <div className="purchased-badge">
                                            <span>✅ OWNED</span>
                                        </div>
                                    )}
                                    
                                    <div className="dinosaur-header">
                                        <h3 className="dinosaur-name">{dinosaur.name}</h3>
                                        <span 
                                            className="rarity-badge"
                                            style={{ 
                                                background: rarityConfig[dinosaur.rarity]?.gradient,
                                                color: '#fff'
                                            }}
                                        >
                                            {dinosaur.rarity}
                                        </span>
                                    </div>
                                    
                                    <div className="dinosaur-meta">
                                        <div className="meta-row">
                                            <span className="meta-label">Weight:</span>
                                            <span className="meta-value">{formatWeight(dinosaur.weight)}</span>
                                        </div>
                                        <div className="meta-row">
                                            <span className="meta-label">Category:</span>
                                            <span className="meta-value capitalize">{dinosaur.category}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="dinosaur-abilities">
                                        <p><strong>Abilities:</strong> {dinosaur.abilities}</p>
                                    </div>
                                    
                                    <div className="price-section">
                                        <div className="price">
                                            <span className="currency-icon">💎</span>
                                            <span className="price-amount">{formatPrice(dinosaur.price)} VP</span>
                                        </div>
                                        
                                        <button
                                            className={`purchase-btn ${canBuy && isAvailable ? 'can-afford' : 'cannot-afford'} ${isPurchased ? 'purchased' : ''}`}
                                            onClick={() => handlePurchaseClick(dinosaur)}
                                            disabled={!canBuy || !isAvailable || isPurchased}
                                        >
                                            {isPurchased ? 'Owned' : 
                                             !isAvailable ? 'Premium Only' :
                                             canBuy ? 'Buy Now' : 'Insufficient VP'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="shop-footer">
                <div className="footer-info">
                    <p><strong>💡 Pro Tip:</strong> Void Pearls are earned through Patreon membership - the exclusive membership currency!</p>
                    <p><strong>🎮 Delivery:</strong> Dinosaurs are delivered automatically to your character when online on the Isle server.</p>
                    <p><strong>🦕 Welcome to Ashveil:</strong> Where legends are born and prehistoric adventures await!</p>
                </div>
            </div>
            
            {/* Purchase Confirmation Modal */}
            {confirmingPurchase && (
                <div className="purchase-modal-overlay">
                    <div className="purchase-modal">
                        <div className="modal-header">
                            <h3>Confirm Purchase</h3>
                            <button 
                                className="close-btn"
                                onClick={cancelPurchase}
                                disabled={processingPurchase}
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="dinosaur-preview">
                                <h4>{confirmingPurchase.name}</h4>
                                <div className="preview-details">
                                    <p><strong>Rarity:</strong> <span className={`rarity-${confirmingPurchase.rarity.toLowerCase()}`}>{confirmingPurchase.rarity}</span></p>
                                    <p><strong>Category:</strong> {confirmingPurchase.category}</p>
                                    <p><strong>Weight:</strong> {formatWeight(confirmingPurchase.weight)}</p>
                                    <p><strong>Abilities:</strong> {confirmingPurchase.abilities}</p>
                                </div>
                            </div>
                            
                            <div className="purchase-summary">
                                <div className="cost-breakdown">
                                    <div className="cost-line">
                                        <span>Cost:</span>
                                        <span className="cost-amount">
                                            <span className="currency-icon">💎</span>
                                            {formatPrice(confirmingPurchase.price)} VP
                                        </span>
                                    </div>
                                    <div className="cost-line">
                                        <span>Current Balance:</span>
                                        <span className="balance-amount">
                                            <span className="currency-icon">💎</span>
                                            {formatPrice(currencies['Void Pearls'] || 0)} VP
                                        </span>
                                    </div>
                                    <div className="cost-line total">
                                        <span>Remaining Balance:</span>
                                        <span className="remaining-amount">
                                            <span className="currency-icon">💎</span>
                                            {formatPrice((currencies['Void Pearls'] || 0) - confirmingPurchase.price)} VP
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn"
                                onClick={cancelPurchase}
                                disabled={processingPurchase}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-btn"
                                onClick={() => confirmPurchase(confirmingPurchase)}
                                disabled={processingPurchase}
                            >
                                {processingPurchase ? (
                                    <>
                                        <span className="spinner">⏳</span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="currency-icon">💎</span>
                                        Purchase for {formatPrice(confirmingPurchase.price)} VP
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoidPearlShop;