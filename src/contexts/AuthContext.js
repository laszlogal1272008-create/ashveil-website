import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Check for saved authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for saved Steam user
      const savedUser = localStorage.getItem('steamUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Verify session is still valid with backend
        try {
          const response = await fetch('/api/auth/user', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.user) {
              // Update user data from backend
              setUser(result.user);
              localStorage.setItem('steamUser', JSON.stringify(result.user));
            }
          } else {
            // Session invalid, clear local storage
            logout();
          }
        } catch (error) {
          console.log('Backend auth check failed, using cached user data');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
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
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('steamUser');
    localStorage.removeItem('discordUser');
  };

  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('steamUser', JSON.stringify(userData));
  };

  // Helper to get Steam ID for API calls
  const getSteamId = () => {
    return user?.steamId || user?.steam_id;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    getSteamId,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;