// Configuration for switching between real server data and mock data
// This allows easy switching between development (mock) and production (real) data

const config = {
  // Environment settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Data source configuration
  USE_REAL_DATA: process.env.REACT_APP_USE_REAL_DATA === 'true',
  
  // Server endpoints
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://ashveil-website.onrender.com',
  
  // The Isle server details
  ISLE_SERVER: {
    IP: '45.45.238.134',
    GAME_PORT: 16006,
    RCON_PORT: 16007,
    NAME: 'Ashveil - The Isle Server'
  },
  
  // Steam authentication
  STEAM_API_KEY: process.env.REACT_APP_STEAM_API_KEY,
  
  // Feature flags
  FEATURES: {
    REAL_INVENTORY: process.env.REACT_APP_REAL_INVENTORY === 'true',
    REAL_CURRENCY: process.env.REACT_APP_REAL_CURRENCY === 'true',
    REAL_PLAYER_DATA: process.env.REACT_APP_REAL_PLAYER_DATA === 'true',
    REAL_SERVER_STATUS: process.env.REACT_APP_REAL_SERVER_STATUS === 'true',
    RCON_ENABLED: process.env.REACT_APP_RCON_ENABLED === 'true',
  },
  
  // Default values for development
  DEV_DEFAULTS: {
    PLAYER_CURRENCY: 500,
    PLAYER_NAME: 'TestPlayer',
    STEAM_ID: '76561198000000000'
  }
};

// Helper functions
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';
export const useRealData = () => config.USE_REAL_DATA;
export const useFeature = (featureName) => config.FEATURES[featureName] || false;

// API endpoints
export const getApiUrl = (endpoint) => `${config.API_BASE_URL}${endpoint}`;

// Server info
export const getServerInfo = () => config.ISLE_SERVER;

export default config;