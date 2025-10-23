import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import './ServerStatus.css';

const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState({
    online: false,
    loading: true,
    players: 0,
    maxPlayers: 300,
    serverName: 'Ashveil - 3X growth - low rules - website',
    lastChecked: null,
    error: null,
    ping: 0,
    uptime: 0
  });

  const [serverInfo, setServerInfo] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [serverMetrics, setServerMetrics] = useState(null);

  useEffect(() => {
    checkServerStatus();
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServerStatus = async () => {
    try {
      setServerStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const serverData = await dataService.getServerStatus();
      console.log('🖥️ ServerStatus: Received server data:', serverData);

      setServerStatus({
        online: serverData.online,
        loading: false,
        players: serverData.players?.online || 0,
        maxPlayers: serverData.players?.max || 300,
        serverName: serverData.name || 'Ashveil - 3X growth - low rules - website',
        lastChecked: new Date().toISOString(),
        error: null,
        ip: serverData.ip || '45.45.238.134',
        port: serverData.port || '16006',
        ping: serverData.ping || 0,
        uptime: serverData.uptime || 0
      });

      setServerInfo(serverData);
      setPlayerList(serverData.players?.list || []);
      setServerMetrics(serverData.metrics || null);
    } catch (error) {
      console.error('🖥️ ServerStatus: Error loading server status:', error);
      setServerStatus(prev => ({
        ...prev,
        loading: false,
        online: false,
        error: error.message
      }));
    }
  };

  const formatLastChecked = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatUptime = (seconds) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="server-status">
      <div className="server-status-header">
        <h3>🖥️ Ashveil Server Status</h3>
        <button 
          className="refresh-btn" 
          onClick={checkServerStatus}
          disabled={serverStatus.loading}
        >
          {serverStatus.loading ? '⟳' : '🔄'} Refresh
        </button>
      </div>

      <div className="live-notice">
        <span className="notice-icon">🟢</span>
        <span className="notice-text">
          Live Status: Connected to Ashveil server at {serverStatus.ip}:{serverStatus.port}
        </span>
      </div>

      <div className="server-main-status">
        <div className={`status-indicator ${serverStatus.online ? 'online' : 'offline'}`}>
          <div className="status-dot"></div>
          <span className="status-text">
            {serverStatus.loading ? 'Checking...' : 
             serverStatus.online ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className="server-info-grid">
          <div className="info-item">
            <span className="label">Server:</span>
            <span className="value">{serverStatus.serverName}</span>
          </div>
          <div className="info-item">
            <span className="label">Address:</span>
            <span className="value">{serverStatus.ip}:{serverStatus.port}</span>
          </div>
          <div className="info-item">
            <span className="label">Players:</span>
            <span className="value">{serverStatus.players}/{serverStatus.maxPlayers}</span>
          </div>
          <div className="info-item">
            <span className="label">Last Check:</span>
            <span className="value">{formatLastChecked(serverStatus.lastChecked)}</span>
          </div>
          {serverStatus.online && (
            <>
              <div className="info-item">
                <span className="label">Ping:</span>
                <span className="value">{serverStatus.ping}ms</span>
              </div>
              <div className="info-item">
                <span className="label">Uptime:</span>
                <span className="value">{formatUptime(serverStatus.uptime)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {serverStatus.error && (
        <div className="status-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{serverStatus.error}</span>
        </div>
      )}

      {serverInfo && (
        <div className="server-details">
          <h4>Server Details</h4>
          <div className="details-grid">
            <div className="detail-item">
              <span className="label">Map:</span>
              <span className="value">{serverInfo.map}</span>
            </div>
            <div className="detail-item">
              <span className="label">Version:</span>
              <span className="value">{serverInfo.version}</span>
            </div>
            <div className="detail-item">
              <span className="label">Password:</span>
              <span className="value">{serverInfo.hasPassword ? '🔒 Protected' : '🔓 Open'}</span>
            </div>
            <div className="detail-item">
              <span className="label">Game Mode:</span>
              <span className="value">{serverInfo.gameMode}</span>
            </div>
            <div className="detail-item">
              <span className="label">Growth Rate:</span>
              <span className="value">3X Accelerated</span>
            </div>
            <div className="detail-item">
              <span className="label">Day/Night:</span>
              <span className="value">{serverInfo.dayLength}m / {serverInfo.nightLength}m</span>
            </div>
          </div>
        </div>
      )}

      {serverMetrics && (
        <div className="server-performance">
          <h4>Server Performance</h4>
          <div className="performance-grid">
            <div className="perf-item">
              <span className="perf-label">CPU Usage:</span>
              <span className="perf-value">{serverMetrics.cpu}%</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Memory:</span>
              <span className="perf-value">{serverMetrics.memory} GB</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Tick Rate:</span>
              <span className="perf-value">{serverMetrics.tickRate} Hz</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Network In:</span>
              <span className="perf-value">{serverMetrics.networkIn} KB/s</span>
            </div>
          </div>
        </div>
      )}

      {serverStatus.online && playerList.length > 0 && (
        <div className="player-list">
          <h4>Current Players ({playerList.length}/{serverStatus.maxPlayers})</h4>
          <div className="players-grid">
            {playerList.map((player, index) => (
              <div key={player.id || index} className="player-item">
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  <span className="player-species">{player.species}</span>
                </div>
                <div className="player-stats">
                  <span className="player-growth">{player.growth}% Growth</span>
                  <span className="player-time">{player.playTime}</span>
                </div>
                <div className="player-location">
                  <span className="location">{player.location}</span>
                  <span className={`status ${player.status.toLowerCase()}`}>{player.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="connection-instructions">
        <h4>How to Connect</h4>
        <div className="connection-info">
          <p><strong>Server Address:</strong> {serverStatus.ip}:{serverStatus.port}</p>
          <p><strong>Password:</strong> CookieMonster420</p>
          <p><strong>Game:</strong> The Isle: Evrima</p>
          <p><strong>Rules:</strong> Low rules, 3X growth rate</p>
          {serverInfo?.discord && (
            <p><strong>Discord:</strong> <a href={serverInfo.discord} target="_blank" rel="noopener noreferrer">Join Community</a></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;