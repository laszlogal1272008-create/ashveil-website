import React, { useState, useEffect } from 'react';
import { generateDailyChallenges, getChallengeStats } from '../data/challengeGenerator';
import './ChallengePreview.css';

function ChallengePreview({ onApprove, onRegenerate }) {
  const [generatedChallenges, setGeneratedChallenges] = useState([]);
  const [challengeStats, setChallengeStats] = useState(null);
  const [selectedChallenges, setSelectedChallenges] = useState(new Set());
  const [challengeCount, setChallengeCount] = useState(6);

  useEffect(() => {
    generateNewChallenges();
  }, [challengeCount]);

  const generateNewChallenges = () => {
    const challenges = generateDailyChallenges(challengeCount);
    setGeneratedChallenges(challenges);
    setChallengeStats(getChallengeStats(challenges));
    setSelectedChallenges(new Set(challenges.map(c => c.id)));
  };

  const toggleChallengeSelection = (challengeId) => {
    const newSelected = new Set(selectedChallenges);
    if (newSelected.has(challengeId)) {
      newSelected.delete(challengeId);
    } else {
      newSelected.add(challengeId);
    }
    setSelectedChallenges(newSelected);
  };

  const handleApprove = () => {
    const approvedChallenges = generatedChallenges.filter(c => selectedChallenges.has(c.id));
    onApprove(approvedChallenges);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#32CD32';
      case 'Medium': return '#FFD700';
      case 'Hard': return '#FF4500';
      case 'Extreme': return '#DC143C';
      default: return '#ccc';
    }
  };

  const getCurrencyColor = (currency) => {
    switch(currency) {
      case 'Razor Talons': return '#DC143C';
      case 'Sylvan Shards': return '#32CD32';
      default: return '#ccc';
    }
  };

  return (
    <div className="challenge-preview">
      <div className="preview-header">
        <h2>🔒 Admin Challenge Generator</h2>
        <p>Preview and approve today's challenges before they go live (Admin Access Only)</p>
        
        <div className="generation-controls">
          <div className="count-control">
            <label htmlFor="challengeCount">Number of Challenges:</label>
            <select 
              id="challengeCount"
              value={challengeCount} 
              onChange={(e) => setChallengeCount(parseInt(e.target.value))}
            >
              <option value={3}>3 Challenges</option>
              <option value={4}>4 Challenges</option>
              <option value={5}>5 Challenges</option>
              <option value={6}>6 Challenges</option>
              <option value={7}>7 Challenges</option>
              <option value={8}>8 Challenges</option>
            </select>
          </div>
          
          <button className="regenerate-btn" onClick={generateNewChallenges}>
            🔄 Generate New Set
          </button>
        </div>
      </div>

      {challengeStats && (
        <div className="challenge-stats">
          <h3>📊 Challenge Distribution</h3>
          <div className="stats-grid">
            <div className="stat-section">
              <h4>By Difficulty</h4>
              {Object.entries(challengeStats.byDifficulty).map(([difficulty, count]) => (
                <div key={difficulty} className="stat-item">
                  <span 
                    className="stat-dot" 
                    style={{ backgroundColor: getDifficultyColor(difficulty) }}
                  ></span>
                  <span>{difficulty}: {count}</span>
                </div>
              ))}
            </div>
            
            <div className="stat-section">
              <h4>By Category</h4>
              {Object.entries(challengeStats.byCategory).map(([category, count]) => (
                <div key={category} className="stat-item">
                  <span className="stat-dot"></span>
                  <span>{category}: {count}</span>
                </div>
              ))}
            </div>
            
            <div className="stat-section">
              <h4>Total Rewards</h4>
              {Object.entries(challengeStats.totalRewards).map(([currency, amount]) => (
                amount > 0 && (
                  <div key={currency} className="stat-item">
                    <span 
                      className="stat-dot" 
                      style={{ backgroundColor: getCurrencyColor(currency) }}
                    ></span>
                    <span>{amount} {currency}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="challenges-grid">
        <div className="grid-header">
          <h3>Generated Challenges ({selectedChallenges.size} selected)</h3>
          <div className="selection-controls">
            <button 
              className="select-all-btn"
              onClick={() => setSelectedChallenges(new Set(generatedChallenges.map(c => c.id)))}
            >
              Select All
            </button>
            <button 
              className="deselect-all-btn"
              onClick={() => setSelectedChallenges(new Set())}
            >
              Deselect All
            </button>
          </div>
        </div>

        {generatedChallenges.map((challenge, index) => (
          <div 
            key={challenge.id} 
            className={`challenge-preview-card ${selectedChallenges.has(challenge.id) ? 'selected' : ''}`}
            onClick={() => toggleChallengeSelection(challenge.id)}
          >
            <div className="card-header">
              <div className="challenge-number">#{index + 1}</div>
              <div className="selection-indicator">
                {selectedChallenges.has(challenge.id) ? '✅' : '⭕'}
              </div>
            </div>
            
            <h4 className="challenge-title">{challenge.title}</h4>
            
            <div className="challenge-meta">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(challenge.difficulty) }}
              >
                {challenge.difficulty}
              </span>
              <span className="category-badge">{challenge.category}</span>
              <span className="time-badge">⏰ {challenge.timeLimit}</span>
            </div>
            
            <p className="challenge-description">{challenge.description}</p>
            
            <div className="challenge-reward">
              <span className="reward-label">Reward:</span>
              <span 
                className="reward-amount"
                style={{ color: getCurrencyColor(challenge.reward.currency) }}
              >
                {challenge.reward.amount} {challenge.reward.currency}
              </span>
            </div>
            
            {challenge.requiredDino && (
              <div className="required-dino">
                <span className="required-label">Required:</span>
                <span className="dino-name">
                  {challenge.requiredDino.charAt(0).toUpperCase() + challenge.requiredDino.slice(1)}
                </span>
              </div>
            )}
            
            <div className="challenge-type">
              <span className="type-label">Type:</span>
              <span className="type-value">{challenge.type}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="preview-actions">
        <div className="action-info">
          <p>Selected {selectedChallenges.size} out of {generatedChallenges.length} challenges</p>
          <p className="balance-tip">
            💡 <strong>Balance Tip:</strong> Include a mix of easy (2-3), medium (2-3), and hard (1-2) challenges for optimal player engagement
          </p>
        </div>
        
        <div className="action-buttons">
          <button 
            className="regenerate-btn"
            onClick={generateNewChallenges}
          >
            🔄 Generate Different Set
          </button>
          
          <button 
            className="approve-btn"
            onClick={handleApprove}
            disabled={selectedChallenges.size === 0}
          >
            ✅ Approve Selected Challenges ({selectedChallenges.size})
          </button>
        </div>
      </div>

      <div className="challenge-tips">
        <h3>💡 Challenge Design Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🎯 Difficulty Balance</h4>
            <p>Aim for 40% Easy, 40% Medium, 15% Hard, 5% Extreme challenges</p>
          </div>
          
          <div className="tip-card">
            <h4>🎮 Variety</h4>
            <p>Include different challenge types: Growth, Combat, Survival, Social, Exploration</p>
          </div>
          
          <div className="tip-card">
            <h4>⏰ Time Limits</h4>
            <p>Easy: 4-8h, Medium: 8-12h, Hard: 12-20h, Extreme: 24h</p>
          </div>
          
          <div className="tip-card">
            <h4>💰 Rewards</h4>
            <p>Scale rewards with difficulty and time investment. Carnivore challenges = Razor Talons, Herbivore = Sylvan Shards</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengePreview;