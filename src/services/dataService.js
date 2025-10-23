// Data service for managing real vs mock data
import config, { getApiUrl } from '../config/appConfig';

// Mock data definitions
const MOCK_DATA = {
  inventory: [
    {
      id: 1,
      name: 'Allosaurus',
      species: 'Allosaurus',
      level: 5,
      growth: 0.85,
      health: 100,
      hunger: 75,
      thirst: 60,
      mutations: ['Cellular Regeneration', 'Featherweight'],
      source: 'grown',
      location: 'Great Falls',
      playTime: '12.5 hours',
      status: 'alive',
      lastPlayed: '2025-10-23T10:30:00Z'
    },
    {
      id: 2,
      name: 'Triceratops',
      species: 'Triceratops',
      level: 3,
      growth: 0.65,
      health: 100,
      hunger: 85,
      thirst: 90,
      mutations: ['Osteosclerosis'],
      source: 'shop',
      location: 'Center Lake',
      playTime: '8.2 hours',
      status: 'alive',
      lastPlayed: '2025-10-23T08:15:00Z'
    },
    {
      id: 3,
      name: 'Carnotaurus',
      species: 'Carnotaurus',
      level: 7,
      growth: 0.95,
      health: 100,
      hunger: 45,
      thirst: 30,
      mutations: ['Nocturnal', 'Hydrodynamic', 'Epidermal Fibrosis'],
      source: 'grown',
      location: 'Jungle Valley',
      playTime: '25.7 hours',
      status: 'alive',
      lastPlayed: '2025-10-23T12:00:00Z'
    },
    {
      id: 4,
      name: 'Dryosaurus',
      species: 'Dryosaurus',
      level: 2,
      growth: 0.45,
      health: 100,
      hunger: 95,
      thirst: 85,
      mutations: [],
      source: 'marketplace',
      location: 'Great Plains',
      playTime: '3.1 hours',
      status: 'alive',
      lastPlayed: '2025-10-22T20:45:00Z'
    },
    {
      id: 5,
      name: 'Stegosaurus',
      species: 'Stegosaurus',
      level: 4,
      growth: 0.75,
      health: 100,
      hunger: 70,
      thirst: 80,
      mutations: ['Sustained Hydration', 'Photosynthetic Tissue'],
      source: 'grown',
      location: 'Forest Edge',
      playTime: '15.3 hours',
      status: 'alive',
      lastPlayed: '2025-10-23T11:20:00Z'
    }
  ],
  
  currency: {
    voidPearls: 25000,
    razorTalons: 15000,
    sylvanShards: 18000
  },
  
  player: {
    name: 'TestPlayer',
    steamId: '76561198000000000',
    level: 42,
    playTime: '156.8 hours',
    joinDate: '2025-08-15',
    lastSeen: '2025-10-23T12:30:00Z',
    permissions: ['player']
  },
  
  serverStatus: {
    online: true,
    playerCount: 87,
    maxPlayers: 200,
    serverName: 'Ashveil - The Isle Server',
    map: 'Isla Spiro',
    version: '0.13.39.55',
    uptime: '7 days, 14 hours',
    lastRestart: '2025-10-16T08:00:00Z'
  }
};

// Data service class
class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Generic cache helper
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Player inventory
  async getPlayerInventory(steamId) {
    const cacheKey = `inventory_${steamId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (config.FEATURES.REAL_INVENTORY) {
      try {
        const response = await fetch(getApiUrl(`/api/player/${steamId}/inventory`));
        if (response.ok) {
          const data = await response.json();
          this.setCachedData(cacheKey, data.inventory);
          return data.inventory;
        }
      } catch (error) {
        console.warn('Failed to fetch real inventory, falling back to mock data:', error);
      }
    }

    // Return mock data
    this.setCachedData(cacheKey, MOCK_DATA.inventory);
    return MOCK_DATA.inventory;
  }

  // Player currency
  async getPlayerCurrency(steamId) {
    const cacheKey = `currency_${steamId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (config.FEATURES.REAL_CURRENCY) {
      try {
        const response = await fetch(getApiUrl(`/api/player/${steamId}/currency`));
        if (response.ok) {
          const data = await response.json();
          this.setCachedData(cacheKey, data.currency);
          return data.currency;
        }
      } catch (error) {
        console.warn('Failed to fetch real currency, falling back to mock data:', error);
      }
    }

    // Return mock data
    this.setCachedData(cacheKey, MOCK_DATA.currency);
    return MOCK_DATA.currency;
  }

  // Player data
  async getPlayerData(steamId) {
    const cacheKey = `player_${steamId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (config.FEATURES.REAL_PLAYER_DATA) {
      try {
        const response = await fetch(getApiUrl(`/api/player/${steamId}`));
        if (response.ok) {
          const data = await response.json();
          this.setCachedData(cacheKey, data.player);
          return data.player;
        }
      } catch (error) {
        console.warn('Failed to fetch real player data, falling back to mock data:', error);
      }
    }

    // Return mock data
    this.setCachedData(cacheKey, MOCK_DATA.player);
    return MOCK_DATA.player;
  }

  // Server status
  async getServerStatus() {
    const cacheKey = 'server_status';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    if (config.FEATURES.REAL_SERVER_STATUS) {
      try {
        const response = await fetch(getApiUrl('/api/server/status'));
        if (response.ok) {
          const data = await response.json();
          this.setCachedData(cacheKey, data);
          return data;
        }
      } catch (error) {
        console.warn('Failed to fetch real server status, falling back to mock data:', error);
      }
    }

    // Return mock data
    this.setCachedData(cacheKey, MOCK_DATA.serverStatus);
    return MOCK_DATA.serverStatus;
  }

  // Execute game command (slay, heal, teleport, etc.)
  async executeCommand(command, playerName, options = {}) {
    if (config.FEATURES.RCON_ENABLED) {
      try {
        // Use backend API directly for RCON commands
        console.log('🎮 Executing RCON command via backend:', command, 'for player:', playerName);
        
        const response = await fetch(getApiUrl('/api/dinosaur/slay'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerName,
            command,
            ...options
          }),
        });

        const result = await response.json();
        return result;
      } catch (error) {
        console.warn('Backend API failed, logging for manual execution:', error);
        return {
          success: false,
          error: 'Command queued for manual execution',
          queued: true,
          command: `${command} ${playerName}`,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Return mock success for development
    return {
      success: true,
      message: `Mock: ${command} executed for ${playerName}`,
      mock: true
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get current configuration
  getConfig() {
    return {
      useRealData: config.USE_REAL_DATA,
      features: config.FEATURES,
      environment: config.NODE_ENV
    };
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;