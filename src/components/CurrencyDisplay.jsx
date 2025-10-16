import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import './CurrencyDisplay.css';

function CurrencyDisplay() {
  const { currencies } = useCurrency();

  return (
    <div className="global-currency-display">
      <div className="currency-item void-pearls">
        <span className="currency-amount">{currencies['Void Pearls'].toLocaleString()}</span>
        <span className="currency-label">Void Pearls</span>
      </div>
      <div className="currency-item razor-talons">
        <span className="currency-amount">{currencies['Razor Talons'].toLocaleString()}</span>
        <span className="currency-label">Razor Talons</span>
      </div>
      <div className="currency-item sylvan-shards">
        <span className="currency-amount">{currencies['Sylvan Shards'].toLocaleString()}</span>
        <span className="currency-label">Sylvan Shards</span>
      </div>
    </div>
  );
}

export default CurrencyDisplay;