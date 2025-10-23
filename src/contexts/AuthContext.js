import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Define updateUser function first
  const updateUser = (userData) => {
    console.log('🔐 AuthContext: updateUser called with data:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    
    // Save to appropriate localStorage key based on provider
    if (userData.provider === 'steam') {
      localStorage.setItem('steamUser', JSON.stringify(userData));
      console.log('🔐 AuthContext: Steam user data saved to localStorage');
    } else if (userData.provider === 'discord') {
      localStorage.setItem('discordUser', JSON.stringify(userData));
      console.log('🔐 AuthContext: Discord user data saved to localStorage');
    }
    
    // Also save the last used provider
    localStorage.setItem('lastAuthProvider', userData.provider);
    
    console.log('🔐 AuthContext: User state updated - user:', userData);
    console.log('🔐 AuthContext: User state updated - isAuthenticated:', true);
  };

  // Check for saved authentication and OAuth callbacks on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 AuthContext: Starting initialization...');
      console.log('🔐 Current URL:', window.location.href);
      
      // First check for OAuth callback parameters
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth');
      const provider = urlParams.get('provider');
      const steamId = urlParams.get('steamid');
      const username = urlParams.get('username');
      const avatar = urlParams.get('avatar');
      const profileurl = urlParams.get('profileurl');
      const realname = urlParams.get('realname');
      const country = urlParams.get('country');
      const timecreated = urlParams.get('timecreated');
      const userId = urlParams.get('userid');
      const discriminator = urlParams.get('discriminator');
      const global_name = urlParams.get('global_name');
      const verified = urlParams.get('verified');
      const locale = urlParams.get('locale');
      const premium_type = urlParams.get('premium_type');
      
      console.log('🔐 AuthContext: URL params detected:', { 
        authStatus, 
        provider, 
        steamId, 
        username: username ? decodeURIComponent(username) : null,
        avatar: avatar ? decodeURIComponent(avatar) : null,
        profileurl: profileurl ? decodeURIComponent(profileurl) : null,
        realname: realname ? decodeURIComponent(realname) : null,
        country,
        timecreated,
        userId 
      });
      
      if (authStatus === 'success' && provider) {
        console.log('🔐 AuthContext: OAuth success detected for provider:', provider);
        
        if (provider === 'steam' && steamId && username) {
          // Steam OAuth success with enhanced data
          const userData = {
            provider: 'steam',
            steamId: steamId,
            displayName: decodeURIComponent(username),
            avatar: avatar ? decodeURIComponent(avatar) : null,
            profileUrl: profileurl ? decodeURIComponent(profileurl) : null,
            realName: realname ? decodeURIComponent(realname) : null,
            country: country || null,
            accountCreated: timecreated ? new Date(parseInt(timecreated) * 1000).getFullYear() : null
          };
          console.log('🔐 AuthContext: Processing Steam OAuth success with enhanced data:', userData);
          updateUser(userData);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          console.log('🔐 AuthContext: Steam OAuth processing complete, loading=false');
          return;
        } else if (provider === 'discord' && userId && username) {
          // Discord OAuth success with enhanced data
          const userData = {
            provider: 'discord',
            discordId: userId,
            username: decodeURIComponent(username),
            discriminator: discriminator || '0000',
            displayName: global_name ? decodeURIComponent(global_name) : decodeURIComponent(username),
            avatar: avatar ? decodeURIComponent(avatar) : null,
            verified: verified === 'true',
            locale: locale || 'en-US',
            premium_type: parseInt(premium_type) || 0,
            fullUsername: discriminator !== '0000' ? 
              `${decodeURIComponent(username)}#${discriminator}` : 
              decodeURIComponent(username)
          };
          console.log('🔐 AuthContext: Processing Discord OAuth success with enhanced data:', userData);
          updateUser(userData);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          console.log('🔐 AuthContext: Discord OAuth processing complete, loading=false');
          return;
        } else {
          console.error('🔐 AuthContext: OAuth success but missing required parameters');
        }
      } else if (authStatus === 'failed') {
        console.error('🔐 OAuth authentication failed for provider:', provider);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        console.log('🔐 AuthContext: No OAuth callback detected, checking localStorage');
      }
      
      // No OAuth callback, check existing auth status from localStorage
      await checkAuthStatus();
    };
    
    initializeAuth();
  }, []);

  const checkAuthStatus = async () => {
    console.log('🔐 AuthContext: checkAuthStatus called');
    try {
      // Check what was the last used provider
      const lastProvider = localStorage.getItem('lastAuthProvider');
      console.log('🔐 AuthContext: Last auth provider:', lastProvider);
      
      let savedUser = null;
      let userType = null;
      
      if (lastProvider === 'discord') {
        // Check Discord first if it was last used
        savedUser = localStorage.getItem('discordUser');
        userType = 'Discord';
      } else {
        // Default to Steam or check Steam first
        savedUser = localStorage.getItem('steamUser');
        userType = 'Steam';
      }
      
      // If no user found with preferred provider, check the other one
      if (!savedUser) {
        if (lastProvider === 'discord') {
          savedUser = localStorage.getItem('steamUser');
          userType = 'Steam';
        } else {
          savedUser = localStorage.getItem('discordUser');
          userType = 'Discord';
        }
      }
      
      console.log(`🔐 AuthContext: localStorage ${userType} user:`, savedUser);
      
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log(`🔐 AuthContext: Parsed ${userType} user data from localStorage:`, userData);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('🔐 AuthContext: Set user and isAuthenticated=true');
        
        console.log(`🔐 AuthContext: Using cached ${userType} user data (no backend verification)`);
      } else {
        console.log('🔐 AuthContext: No saved user found in localStorage');
        setUser(null);
        setIsAuthenticated(false);
        console.log('🔐 AuthContext: Set user=null and isAuthenticated=false');
      }
    } catch (error) {
      console.error('🔐 Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log('🔐 AuthContext: checkAuthStatus complete, loading=false');
    }
  };

  const login = async (provider = 'steam') => {
    setIsLoading(true);
    
    if (provider === 'steam') {
      // Redirect to backend Steam OAuth
      window.location.href = '/auth/steam';
    }
  };

  const logout = () => {
    console.log('🔐 AuthContext: Logging out user');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('steamUser');
    localStorage.removeItem('discordUser');
    localStorage.removeItem('lastAuthProvider');
    console.log('🔐 AuthContext: Cleared all authentication data');
  };

  // Function to switch between saved accounts
  const switchAccount = (provider) => {
    console.log(`🔐 AuthContext: Switching to ${provider} account`);
    let savedUser = null;
    
    if (provider === 'steam') {
      savedUser = localStorage.getItem('steamUser');
    } else if (provider === 'discord') {
      savedUser = localStorage.getItem('discordUser');
    }
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('lastAuthProvider', provider);
      console.log(`🔐 AuthContext: Switched to ${provider} account:`, userData);
    } else {
      console.log(`🔐 AuthContext: No saved ${provider} account found`);
    }
  };

  // Helper to get Steam ID for API calls
  const getSteamId = () => {
    return user?.steamId || user?.steam_id;
  };

  // Helper to get current player identifier for data service
  const getPlayerId = () => {
    if (user?.steamId) {
      return { type: 'steam', id: user.steamId };
    } else if (user?.discordId) {
      return { type: 'discord', id: user.discordId };
    }
    return null;
  };

  // Get player data using data service
  const getPlayerData = async () => {
    const playerId = getPlayerId();
    if (playerId) {
      return await dataService.getPlayerData(playerId.id);
    }
    return null;
  };

  // Get player inventory using data service
  const getPlayerInventory = async () => {
    const playerId = getPlayerId();
    if (playerId) {
      return await dataService.getPlayerInventory(playerId.id);
    }
    return [];
  };

  // Get player currency using data service  
  const getPlayerCurrency = async () => {
    const playerId = getPlayerId();
    if (playerId) {
      return await dataService.getPlayerCurrency(playerId.id);
    }
    return null;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    getSteamId,
    getPlayerId,
    getPlayerData,
    getPlayerInventory,
    getPlayerCurrency,
    checkAuthStatus,
    switchAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;