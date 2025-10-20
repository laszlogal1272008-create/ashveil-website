import React, { useState } from 'react';
import './ThemeSelector.css';

const ThemeSelector = ({ onThemeChange, currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { id: 'dawn', name: 'Dawn', icon: '🌅', color: '#FF6B6B' },
    { id: 'day', name: 'Day', icon: '☀️', color: '#CC0000' },
    { id: 'dusk', name: 'Dusk', icon: '🌆', color: '#8B4B8B' },
    { id: 'night', name: 'Night', icon: '🌙', color: '#4169E1' }
  ];

  const handleThemeSelect = (themeId) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  const getCurrentTheme = () => themes.find(t => t.id === currentTheme) || themes[1];

  return (
    <div className="theme-selector">
      <div 
        className="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: getCurrentTheme().color }}
      >
        <span className="theme-icon">{getCurrentTheme().icon}</span>
        <span className="theme-name">{getCurrentTheme().name}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="theme-dropdown">
          {themes.map(theme => (
            <div
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeSelect(theme.id)}
              style={{ 
                borderColor: theme.color,
                backgroundColor: currentTheme === theme.id ? `${theme.color}20` : 'transparent'
              }}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && <span className="active-indicator">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;