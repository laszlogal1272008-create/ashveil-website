import React, { createContext, useContext, useState } from 'react';

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
    'Void Pearls': 25000,
    'Razor Talons': 15000,
    'Sylvan Shards': 18000
  });

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
      canAfford 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};