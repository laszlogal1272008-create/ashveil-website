import React, { createContext, useContext, useState, useEffect } from 'react';
import dataService from '../services/dataService';
import config from '../config/appConfig';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState({
    'Void Pearls': 0,
    'Razor Talons': 0,
    'Sylvan Shards': 0
  });
  const [loading, setLoading] = useState(true);

  // Load player currency on mount
  useEffect(() => {
    loadPlayerCurrency();
  }, []);

  const loadPlayerCurrency = async () => {
    try {
      setLoading(true);
      
      // Get player Steam ID from auth context or default
      const steamId = config.DEV_DEFAULTS.STEAM_ID; // TODO: Get from actual auth
      
      const currencyData = await dataService.getPlayerCurrency(steamId);
      
      // Map API response to context format
      setCurrencies({
        'Void Pearls': currencyData.voidPearls || 0,
        'Razor Talons': currencyData.razorTalons || 0,
        'Sylvan Shards': currencyData.sylvanShards || 0
      });
      
    } catch (error) {
      console.error('Failed to load player currency:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = (currencyType, amount) => {
    setCurrencies(prev => ({
      ...prev,
      [currencyType]: prev[currencyType] + amount
    }));
  };

  const spendCurrency = (currencyType, amount) => {
    setCurrencies(prev => ({
      ...prev,
      [currencyType]: prev[currencyType] - amount
    }));
  };

  const canAfford = (currencyType, amount) => {
    return currencies[currencyType] >= amount;
  };

  return (
    <CurrencyContext.Provider value={{ 
      currencies, 
      updateCurrency, 
      spendCurrency, 
      canAfford,
      loading,
      refreshCurrency: loadPlayerCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};