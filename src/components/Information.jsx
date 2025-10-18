import React, { useState } from 'react';
import './Information.css';

function Information() {
  const [activeTab, setActiveTab] = useState('server');

  const serverStats = {
    population: 47,
    maxSlots: 100,
    uptime: '99.8%',
    version: 'Evrima 0.15.120.78',
    region: 'North America',
    restartTime: '06:00 UTC Daily'
  };

  const currencyGuide = {
    'Void Pearls': {
      description: 'Premium currency for Apex and Legendary dinosaurs',
      howToEarn: ['Daily login rewards', 'Achievement completion', 'Special events', 'Patreon rewards'],
      uses: ['Apex dinosaur purchases', 'Legendary species', 'Premium mutations', 'Exclusive skins']
    },
    'Razor Talons': {
      description: 'Carnivore currency earned through hunting and PvP',
      howToEarn: ['Successful hunts', 'Player kills', 'Surviving as carnivore', 'Territory control'],
      uses: ['Carnivore species', 'Predator abilities', 'Hunt-specific items', 'Combat mutations']
    },
    'Sylvan Shards': {
      description: 'Herbivore currency earned through peaceful gameplay',
      howToEarn: ['Surviving as herbivore', 'Herd leadership', 'Plant consumption', 'Peaceful interactions'],
      uses: ['Herbivore species', 'Defensive abilities', 'Herd-based items', 'Growth mutations']
    }
  };

  const gameGuides = [
    {
      title: 'Survival Basics',
      content: 'Master the fundamentals: finding water, avoiding predators, understanding your dinosaur\'s needs, and navigating the world safely.'
    },
    {
      title: 'Growth System',
      content: 'Learn how dinosaurs grow from juveniles to adults, experience requirements, and how to maximize your growth efficiency.'
    },
    {
      title: 'Mutation System',
      content: 'Discover genetic mutations that enhance your dinosaur\'s abilities, from combat bonuses to survival advantages.'
    },
    {
      title: 'PvP Combat',
      content: 'Master combat mechanics, ambush tactics, group strategies, and how to become an apex predator.'
    },
    {
      title: 'Herd Dynamics',
      content: 'Understand pack hunting, herd protection, communication systems, and cooperative gameplay strategies.'
    }
  ];

  const achievementCategories = [
    {
      name: 'Predator Achievements',
      examples: ['First Blood', 'Apex Hunter', 'Pack Leader', 'Territory Master'],
      rewards: 'Razor Talons, Carnivore mutations, Combat titles'
    },
    {
      name: 'Herbivore Achievements',
      examples: ['Peaceful Giant', 'Herd Guardian', 'Plant Master', 'Migration Leader'],
      rewards: 'Sylvan Shards, Growth mutations, Peaceful titles'
    },
    {
      name: 'Survival Achievements',
      examples: ['Ancient One', 'Survivor', 'Explorer', 'Legendary Beast'],
      rewards: 'Void Pearls, Rare mutations, Prestige titles'
    }
  ];

  return (
    <div className="information-page">
      <div className="information-header">
        <h1>🌋 Ashveil Information Hub</h1>
        <p>Everything you need to know about surviving in the prehistoric world</p>
      </div>

      <div className="info-tabs">
        <button 
          className={`tab-btn ${activeTab === 'server' ? 'active' : ''}`}
          onClick={() => setActiveTab('server')}
        >
          🖥️ Server Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'guides' ? 'active' : ''}`}
          onClick={() => setActiveTab('guides')}
        >
          📖 Game Guides
        </button>
        <button 
          className={`tab-btn ${activeTab === 'economy' ? 'active' : ''}`}
          onClick={() => setActiveTab('economy')}
        >
          💎 Economy
        </button>
        <button 
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          🏆 Community
        </button>
        <button 
          className={`tab-btn ${activeTab === 'technical' ? 'active' : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          ⚙️ Technical
        </button>
      </div>

      <div className="info-content">
        {activeTab === 'server' && (
          <div className="info-section">
            <h2>🖥️ Ashveil Server Information</h2>
            
            <div className="server-stats-grid">
              <div className="stat-card">
                <h3>Current Population</h3>
                <div className="stat-value">{serverStats.population}/{serverStats.maxSlots}</div>
                <div className="stat-indicator">
                  <div className="online-dot"></div>
                  <span>Server Online</span>
                </div>
              </div>
              
              <div className="stat-card">
                <h3>Server Uptime</h3>
                <div className="stat-value">{serverStats.uptime}</div>
                <span className="stat-label">Last 30 days</span>
              </div>
              
              <div className="stat-card">
                <h3>Game Version</h3>
                <div className="stat-value">{serverStats.version}</div>
                <span className="stat-label">Latest stable</span>
              </div>
            </div>

            <div className="server-details">
              <div className="detail-section">
                <h3>🌍 Server Details</h3>
                <ul>
                  <li><strong>Region:</strong> {serverStats.region}</li>
                  <li><strong>Daily Restart:</strong> {serverStats.restartTime}</li>
                  <li><strong>Max Players:</strong> {serverStats.maxSlots} concurrent</li>
                  <li><strong>Server Type:</strong> Semi-Realism with enhanced features</li>
                </ul>
              </div>

              <div className="detail-section">
                <h3>📋 Server Rules</h3>
                <ul>
                  <li>🚫 No cheating, hacking, or exploiting</li>
                  <li>🤝 Respect all players and staff</li>
                  <li>🦖 No random killing (RDM) - hunt with purpose</li>
                  <li>💬 Keep chat appropriate and dinosaur-themed</li>
                  <li>🏠 No base camping or spawn killing</li>
                  <li>👥 Maximum pack size: 6 for carnivores, 12 for herbivores</li>
                </ul>
              </div>

              <div className="detail-section">
                <h3>📞 Contact & Support</h3>
                <div className="contact-links">
                  <a href="#" className="contact-btn discord">
                    🎮 Join Discord Server
                  </a>
                  <a href="#" className="contact-btn steam">
                    🖥️ Steam Community
                  </a>
                  <a href="#" className="contact-btn patreon">
                    💎 Support on Patreon
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guides' && (
          <div className="info-section">
            <h2>📖 Isle: Evrima Game Guides</h2>
            
            <div className="guides-grid">
              {gameGuides.map((guide, index) => (
                <div key={index} className="guide-card">
                  <h3>{guide.title}</h3>
                  <p>{guide.content}</p>
                  <button className="guide-btn">Read Full Guide</button>
                </div>
              ))}
            </div>

            <div className="quick-tips">
              <h3>🎯 Quick Survival Tips</h3>
              <div className="tips-grid">
                <div className="tip-item">
                  <span className="tip-icon">💧</span>
                  <span>Always stay near water sources</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🌙</span>
                  <span>Nighttime offers better stealth but lower visibility</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">👂</span>
                  <span>Listen for calls - communication is survival</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🏃</span>
                  <span>Know when to fight and when to flee</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🦴</span>
                  <span>Conserve stamina - it's your lifeline</span>
                </div>
                <div className="tip-item">
                  <span className="tip-icon">🌱</span>
                  <span>Juveniles grow faster with consistent food</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'economy' && (
          <div className="info-section">
            <h2>💎 Ashveil Economy System</h2>
            
            <div className="currency-guide">
              {Object.entries(currencyGuide).map(([currency, info]) => (
                <div key={currency} className="currency-card">
                  <h3>{currency}</h3>
                  <p className="currency-description">{info.description}</p>
                  
                  <div className="currency-details">
                    <div className="earn-methods">
                      <h4>How to Earn:</h4>
                      <ul>
                        {info.howToEarn.map((method, index) => (
                          <li key={index}>{method}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="currency-uses">
                      <h4>What to Buy:</h4>
                      <ul>
                        {info.uses.map((use, index) => (
                          <li key={index}>{use}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="economy-tips">
              <h3>💰 Economic Strategy Tips</h3>
              <div className="tips-list">
                <div className="tip">
                  <strong>🎯 Diversify Your Portfolio:</strong> Earn multiple currencies to access all content types.
                </div>
                <div className="tip">
                  <strong>📈 Market Timing:</strong> Monitor the marketplace for good deals on rare dinosaurs.
                </div>
                <div className="tip">
                  <strong>💎 Save for Apex:</strong> Void Pearls are rare - save them for truly special purchases.
                </div>
                <div className="tip">
                  <strong>🔄 Active Trading:</strong> Use the marketplace to trade excess dinosaurs for currency.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="info-section">
            <h2>🏆 Community Features & Achievements</h2>
            
            <div className="achievement-system">
              <h3>🎖️ Achievement Categories</h3>
              <div className="achievement-grid">
                {achievementCategories.map((category, index) => (
                  <div key={index} className="achievement-card">
                    <h4>{category.name}</h4>
                    <div className="achievement-examples">
                      <strong>Examples:</strong>
                      <ul>
                        {category.examples.map((example, i) => (
                          <li key={i}>{example}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="achievement-rewards">
                      <strong>Rewards:</strong> {category.rewards}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="leaderboard-info">
              <h3>📊 Leaderboard System</h3>
              <div className="leaderboard-details">
                <div className="detail-card">
                  <h4>🗡️ K/D Ratio Leaderboard</h4>
                  <p>Tracks your combat effectiveness and survival skills in PvP scenarios.</p>
                </div>
                <div className="detail-card">
                  <h4>🥩 Razor Talons Wealth</h4>
                  <p>Shows the richest carnivore players who've mastered the hunt.</p>
                </div>
                <div className="detail-card">
                  <h4>🌿 Sylvan Shards Wealth</h4>
                  <p>Displays peaceful giants who've thrived through herbivore gameplay.</p>
                </div>
                <div className="detail-card">
                  <h4>⏰ Play Time Champions</h4>
                  <p>Honors the most dedicated survivors of the prehistoric world.</p>
                </div>
              </div>
            </div>

            <div className="community-events">
              <h3>🎉 Community Events</h3>
              <div className="events-list">
                <div className="event-item">
                  <strong>🌙 Night Hunt Events:</strong> Special nighttime hunting competitions with bonus rewards
                </div>
                <div className="event-item">
                  <strong>🦕 Migration Madness:</strong> Server-wide herbivore migration events
                </div>
                <div className="event-item">
                  <strong>👑 King of the Hill:</strong> Territory control competitions for apex predators
                </div>
                <div className="event-item">
                  <strong>🎨 Screenshot Contests:</strong> Show off your most epic dinosaur moments
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="info-section">
            <h2>⚙️ Technical Information</h2>
            
            <div className="tech-sections">
              <div className="tech-card">
                <h3>🔐 Steam Integration</h3>
                <div className="tech-content">
                  <p><strong>How it works:</strong> Your Steam account links to your in-game profile, enabling seamless progress tracking and social features.</p>
                  <ul>
                    <li>Automatic dinosaur inventory syncing</li>
                    <li>Real-time play statistics</li>
                    <li>Friend integration and teleport features</li>
                    <li>Achievement tracking across platforms</li>
                  </ul>
                  <div className="tech-note">
                    <strong>Privacy:</strong> We only access public Steam profile data and game statistics.
                  </div>
                </div>
              </div>

              <div className="tech-card">
                <h3>🌐 Website Features</h3>
                <div className="tech-content">
                  <ul>
                    <li><strong>Responsive Design:</strong> Works on desktop, tablet, and mobile</li>
                    <li><strong>Real-time Updates:</strong> Live synchronization with game server</li>
                    <li><strong>Secure Trading:</strong> Encrypted marketplace transactions</li>
                    <li><strong>Cloud Saves:</strong> Your progress is safely backed up</li>
                  </ul>
                </div>
              </div>

              <div className="tech-card">
                <h3>🔧 Troubleshooting</h3>
                <div className="tech-content">
                  <div className="troubleshoot-item">
                    <strong>Steam Login Issues:</strong>
                    <p>Clear browser cache, disable ad blockers, ensure Steam is running</p>
                  </div>
                  <div className="troubleshoot-item">
                    <strong>Currency Not Updating:</strong>
                    <p>Check internet connection, refresh page, contact support if persistent</p>
                  </div>
                  <div className="troubleshoot-item">
                    <strong>Dinosaur Not Syncing:</strong>
                    <p>Ensure you're connected to the correct Steam account and server</p>
                  </div>
                </div>
              </div>

              <div className="tech-card">
                <h3>📋 Update Logs</h3>
                <div className="tech-content">
                  <div className="update-item">
                    <strong>v2.1.0 - October 2025:</strong>
                    <ul>
                      <li>Enhanced marketplace with advanced filtering</li>
                      <li>New achievement system implementation</li>
                      <li>Improved mobile responsiveness</li>
                    </ul>
                  </div>
                  <div className="update-item">
                    <strong>v2.0.0 - September 2025:</strong>
                    <ul>
                      <li>Complete UI overhaul with volcanic theme</li>
                      <li>Steam integration beta launch</li>
                      <li>Three-currency system implementation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="system-requirements">
              <h3>💻 System Requirements</h3>
              <div className="requirements-grid">
                <div className="req-section">
                  <h4>Recommended Browsers:</h4>
                  <ul>
                    <li>Chrome 90+</li>
                    <li>Firefox 88+</li>
                    <li>Safari 14+</li>
                    <li>Edge 90+</li>
                  </ul>
                </div>
                <div className="req-section">
                  <h4>Required for Full Features:</h4>
                  <ul>
                    <li>Steam client installed</li>
                    <li>JavaScript enabled</li>
                    <li>Stable internet connection</li>
                    <li>Cookies and local storage enabled</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Information;
