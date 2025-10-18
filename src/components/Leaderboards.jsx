import React, { useState } from 'react';
import './Leaderboards.css';

function Leaderboards() {
  const [activeBoard, setActiveBoard] = useState('kd-ratio');

  // Mock leaderboard data
  const kdRatioData = [
    { rank: 1, player: 'ApexPredator', kills: 2847, deaths: 156, kd: 18.25, mainDino: 'T-Rex Alpha' },
    { rank: 2, player: 'VelocityKiller', kills: 1923, deaths: 134, kd: 14.35, mainDino: 'Velociraptor Pack' },
    { rank: 3, player: 'DeathClaw92', kills: 1654, deaths: 127, kd: 13.02, mainDino: 'Allosaurus' },
    { rank: 4, player: 'BloodThirsty', kills: 1456, deaths: 145, kd: 10.04, mainDino: 'Carnotaurus' },
    { rank: 5, player: 'HuntMaster', kills: 1298, deaths: 156, kd: 8.32, mainDino: 'Giganotosaurus' },
    { rank: 6, player: 'SavageReaper', kills: 1187, deaths: 178, kd: 6.67, mainDino: 'Spinosaurus' },
    { rank: 7, player: 'FeralBeast', kills: 1034, deaths: 189, kd: 5.47, mainDino: 'Utahraptor' },
    { rank: 8, player: 'ClawStrike', kills: 967, deaths: 201, kd: 4.81, mainDino: 'Deinonychus' },
    { rank: 9, player: 'NightHunter', kills: 845, deaths: 234, kd: 3.61, mainDino: 'Therizinosaurus' },
    { rank: 10, player: 'RaptorLord', kills: 723, deaths: 267, kd: 2.71, mainDino: 'Compsognathus' }
  ];

  const razorTalonsData = [
    { rank: 1, player: 'CarnivoreKing', amount: 847350, mainDino: 'T-Rex Overlord', source: 'PvP Domination' },
    { rank: 2, player: 'MeatEater99', amount: 623480, mainDino: 'Spinosaurus', source: 'Hunt Rewards' },
    { rank: 3, player: 'BloodMoney', amount: 456720, mainDino: 'Allosaurus', source: 'Tournament Wins' },
    { rank: 4, player: 'PredatorWealth', amount: 398250, mainDino: 'Carnotaurus', source: 'Trading Empire' },
    { rank: 5, player: 'RichRaptor', amount: 345890, mainDino: 'Utahraptor', source: 'Business Deals' },
    { rank: 6, player: 'GoldClaw', amount: 298760, mainDino: 'Deinonychus', source: 'Market Trading' },
    { rank: 7, player: 'WealthyHunter', amount: 267340, mainDino: 'Giganotosaurus', source: 'Rare Drops' },
    { rank: 8, player: 'MoneyBeast', amount: 234680, mainDino: 'Acrocanthosaurus', source: 'Clan Wars' },
    { rank: 9, player: 'RichPredator', amount: 198750, mainDino: 'Ceratosaurus', source: 'Event Rewards' },
    { rank: 10, player: 'TalonTycoon', amount: 176420, mainDino: 'Megalosaurus', source: 'Daily Grinding' }
  ];

  const sylvanShardsData = [
    { rank: 1, player: 'PlantLord', amount: 923670, mainDino: 'Brachiosaurus Titan', source: 'Peaceful Growth' },
    { rank: 2, player: 'HerbKing', amount: 687340, mainDino: 'Triceratops Elder', source: 'Forest Guardian' },
    { rank: 3, player: 'LeafCollector', amount: 534290, mainDino: 'Parasaurolophus', source: 'Herd Leadership' },
    { rank: 4, player: 'GreenThumb', amount: 467850, mainDino: 'Ankylosaurus', source: 'Resource Farming' },
    { rank: 5, player: 'NatureWealth', amount: 398470, mainDino: 'Stegosaurus', source: 'Ecosystem Balance' },
    { rank: 6, player: 'PeacefulGiant', amount: 345780, mainDino: 'Diplodocus', source: 'Migration Routes' },
    { rank: 7, player: 'PlantEater', amount: 289650, mainDino: 'Iguanodon', source: 'Territory Control' },
    { rank: 8, player: 'HerbivoreRich', amount: 234890, mainDino: 'Hadrosaurus', source: 'Community Building' },
    { rank: 9, player: 'GentleGiant', amount: 198360, mainDino: 'Maiasaura', source: 'Nest Protection' },
    { rank: 10, player: 'LeafMaster', amount: 167420, mainDino: 'Therizinosaurus', source: 'Plant Cultivation' }
  ];

  const playTimeData = [
    { rank: 1, player: 'DinoAddict', hours: 2847, days: 118, favActivity: 'Exploring', status: 'Legendary Explorer' },
    { rank: 2, player: 'NoLifeGamer', hours: 2634, days: 109, favActivity: 'PvP Combat', status: 'Eternal Warrior' },
    { rank: 3, player: 'TimeSpender', hours: 2456, days: 102, favActivity: 'Breeding', status: 'Master Breeder' },
    { rank: 4, player: 'LifelessGamer', hours: 2298, days: 95, favActivity: 'Building', status: 'Architect Lord' },
    { rank: 5, player: 'GameAddict99', hours: 2134, days: 88, favActivity: 'Hunting', status: 'Alpha Hunter' },
    { rank: 6, player: 'NoSleepDino', hours: 1987, days: 82, favActivity: 'Trading', status: 'Trade Master' },
    { rank: 7, player: 'GrindMaster', hours: 1823, days: 75, favActivity: 'Collecting', status: 'Hoarder King' },
    { rank: 8, player: 'TimeWaster', hours: 1678, days: 69, favActivity: 'Socializing', status: 'Community Leader' },
    { rank: 9, player: 'DedicatedPlayer', hours: 1534, days: 63, favActivity: 'Survival', status: 'Survival Expert' },
    { rank: 10, player: 'ConstantGamer', hours: 1423, days: 59, favActivity: 'Mutations', status: 'Gene Scientist' }
  ];

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const formatTime = (hours) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#FF4500'; // Orange
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="leaderboards-page">
      <div className="leaderboards-header">
        <h1>Global Leaderboards</h1>
        <p>Compete with players worldwide across different categories</p>
      </div>

      <div className="leaderboard-tabs">
        <button 
          className={`tab-btn ${activeBoard === 'kd-ratio' ? 'active' : ''}`}
          onClick={() => setActiveBoard('kd-ratio')}
        >
          ⚔️ K/D Ratio
        </button>
        <button 
          className={`tab-btn ${activeBoard === 'razor-talons' ? 'active' : ''}`}
          onClick={() => setActiveBoard('razor-talons')}
        >
          🥩 Razor Talons
        </button>
        <button 
          className={`tab-btn ${activeBoard === 'sylvan-shards' ? 'active' : ''}`}
          onClick={() => setActiveBoard('sylvan-shards')}
        >
          🌿 Sylvan Shards
        </button>
        <button 
          className={`tab-btn ${activeBoard === 'play-time' ? 'active' : ''}`}
          onClick={() => setActiveBoard('play-time')}
        >
          ⏰ Play Time
        </button>
      </div>

      <div className="leaderboard-content">
        {activeBoard === 'kd-ratio' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <h2>🏆 Top K/D Ratios</h2>
              <p>The deadliest predators in the prehistoric world</p>
            </div>
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Kills</span>
                <span>Deaths</span>
                <span>K/D Ratio</span>
                <span>Main Dinosaur</span>
              </div>
              {kdRatioData.map(player => (
                <div key={player.rank} className="table-row">
                  <span className="rank" style={{color: getRankColor(player.rank)}}>
                    {getRankIcon(player.rank)}
                  </span>
                  <span className="player-name">{player.player}</span>
                  <span className="kills">{formatNumber(player.kills)}</span>
                  <span className="deaths">{formatNumber(player.deaths)}</span>
                  <span className="kd-ratio">{player.kd}</span>
                  <span className="main-dino">{player.mainDino}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeBoard === 'razor-talons' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <h2>💰 Richest Carnivores</h2>
              <p>Players with the most Razor Talons (Carnivore Currency)</p>
            </div>
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Razor Talons</span>
                <span>Main Dinosaur</span>
                <span>Primary Source</span>
              </div>
              {razorTalonsData.map(player => (
                <div key={player.rank} className="table-row">
                  <span className="rank" style={{color: getRankColor(player.rank)}}>
                    {getRankIcon(player.rank)}
                  </span>
                  <span className="player-name">{player.player}</span>
                  <span className="currency-amount">
                    🥩 {formatNumber(player.amount)}
                  </span>
                  <span className="main-dino">{player.mainDino}</span>
                  <span className="source">{player.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeBoard === 'sylvan-shards' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <h2>🌿 Richest Herbivores</h2>
              <p>Players with the most Sylvan Shards (Herbivore Currency)</p>
            </div>
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Sylvan Shards</span>
                <span>Main Dinosaur</span>
                <span>Primary Source</span>
              </div>
              {sylvanShardsData.map(player => (
                <div key={player.rank} className="table-row">
                  <span className="rank" style={{color: getRankColor(player.rank)}}>
                    {getRankIcon(player.rank)}
                  </span>
                  <span className="player-name">{player.player}</span>
                  <span className="currency-amount">
                    🌿 {formatNumber(player.amount)}
                  </span>
                  <span className="main-dino">{player.mainDino}</span>
                  <span className="source">{player.source}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeBoard === 'play-time' && (
          <div className="leaderboard-section">
            <div className="section-header">
              <h2>⏰ Most Dedicated Players</h2>
              <p>Players who've spent the most time in the prehistoric world</p>
            </div>
            <div className="leaderboard-table">
              <div className="table-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Play Time</span>
                <span>Days Played</span>
                <span>Favorite Activity</span>
                <span>Status</span>
              </div>
              {playTimeData.map(player => (
                <div key={player.rank} className="table-row">
                  <span className="rank" style={{color: getRankColor(player.rank)}}>
                    {getRankIcon(player.rank)}
                  </span>
                  <span className="player-name">{player.player}</span>
                  <span className="play-time">{formatNumber(player.hours)} hours</span>
                  <span className="days-played">{player.days} days</span>
                  <span className="activity">{player.favActivity}</span>
                  <span className="status">{player.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboards;
