import React, { useState, useEffect } from 'react';
import './OwnerPanel.css';
import UserManagement from './UserManagement';
import RecurringDonations from './RecurringDonations';
import ServerControlPanel from './ServerControlPanel';

function OwnerPanel() {
  const [isOwnerVerified, setIsOwnerVerified] = useState(false);
  const [ownerCodeInput, setOwnerCodeInput] = useState('');
  const [showAccessPrompt, setShowAccessPrompt] = useState(true);
  const [serverStats, setServerStats] = useState({});
  const [adminLogs, setAdminLogs] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, users, server

  // Super secure owner verification code - change this to something only you know
  const OWNER_MASTER_KEY = 'ashveil-owner-2025-laszlo-master-key';

  // Check if owner is already verified (session storage)
  useEffect(() => {
    const ownerSession = sessionStorage.getItem('ownerVerified');
    if (ownerSession === OWNER_MASTER_KEY) {
      setIsOwnerVerified(true);
      setShowAccessPrompt(false);
      loadOwnerData();
    }
  }, []);

  const verifyOwnerAccess = () => {
    if (ownerCodeInput === OWNER_MASTER_KEY) {
      setIsOwnerVerified(true);
      setShowAccessPrompt(false);
      setOwnerCodeInput('');
      sessionStorage.setItem('ownerVerified', OWNER_MASTER_KEY);
      loadOwnerData();
      alert('✅ Owner access granted. Welcome back, Laszlo!');
    } else {
      alert('❌ Invalid owner key. Access denied.');
      setOwnerCodeInput('');
      
      // Log failed attempt (you could send this to your backend)
      console.warn('Failed owner access attempt:', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ip: 'logged'
      });
    }
  };

  const cancelOwnerPrompt = () => {
    setShowAccessPrompt(false);
    // Redirect away from owner panel
    window.location.href = '/';
  };

  const loadOwnerData = async () => {
    try {
      // Load critical server data, admin activity logs, etc.
      // This would connect to your backend with owner-level permissions
      
      setServerStats({
        totalRevenue: 2456.78,
        activePatrons: 23,
        serverUptime: '15 days, 4 hours',
        totalPlayers: 1247,
        newPlayersToday: 18,
        rconCommands: 342,
        databaseSize: '2.4 GB',
        backupStatus: 'Last backup: 2 hours ago'
      });

      setAdminLogs([
        { admin: 'AdminUser1', action: 'Generated new challenges', timestamp: '2 hours ago' },
        { admin: 'AdminUser2', action: 'Used slay command on player', timestamp: '4 hours ago' },
        { admin: 'AdminUser1', action: 'Modified server settings', timestamp: '1 day ago' },
        { admin: 'AdminUser3', action: 'Banned player: TrollingUser', timestamp: '2 days ago' }
      ]);

      setSystemMetrics({
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 34,
        networkIn: '15.3 MB/s',
        networkOut: '8.7 MB/s',
        activeConnections: 89
      });

    } catch (error) {
      console.error('Failed to load owner data:', error);
    }
  };

  const handleServerRestart = async () => {
    if (window.confirm('⚠️ Are you sure you want to restart the Isle server? This will disconnect all players!')) {
      try {
        // Send restart command to your RCON system
        const response = await fetch('/api/owner/server/restart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OWNER_MASTER_KEY}`
          }
        });

        if (response.ok) {
          alert('✅ Server restart initiated. Players will be notified.');
        } else {
          alert('❌ Failed to restart server.');
        }
      } catch (error) {
        console.error('Server restart error:', error);
        alert('❌ Server restart failed.');
      }
    }
  };

  const handleDatabaseBackup = async () => {
    if (window.confirm('Create manual database backup? This may take a few minutes.')) {
      try {
        const response = await fetch('/api/owner/database/backup', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OWNER_MASTER_KEY}`
          }
        });

        if (response.ok) {
          alert('✅ Database backup initiated successfully.');
        } else {
          alert('❌ Database backup failed.');
        }
      } catch (error) {
        console.error('Database backup error:', error);
        alert('❌ Database backup failed.');
      }
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerVerified(false);
    setShowAccessPrompt(true);
    sessionStorage.removeItem('ownerVerified');
    // Clear sensitive data
    setServerStats({});
    setAdminLogs([]);
    setSystemMetrics({});
  };

  const exportServerData = () => {
    const exportData = {
      serverStats,
      adminLogs,
      systemMetrics,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Owner'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `ashveil-server-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (!isOwnerVerified) {
    return (
      <div className="owner-panel">
        {showAccessPrompt && (
          <div className="owner-access-modal">
            <div className="owner-access-content">
              <div className="owner-access-header">
                <h2>🔐 Owner Access Required</h2>
                <p>This area is restricted to the server owner only.</p>
              </div>
              
              <div className="owner-access-form">
                <input
                  type="password"
                  placeholder="Enter owner master key..."
                  value={ownerCodeInput}
                  onChange={(e) => setOwnerCodeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && verifyOwnerAccess()}
                  className="owner-key-input"
                  autoFocus
                />
                
                <div className="owner-access-actions">
                  <button className="verify-owner-btn" onClick={verifyOwnerAccess}>
                    🔓 Verify Owner Access
                  </button>
                  <button className="cancel-owner-btn" onClick={cancelOwnerPrompt}>
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="owner-security-notice">
                <small>🛡️ Access attempts are logged for security purposes</small>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="owner-panel">
      <div className="owner-panel-header">
        <h1>👑 Ashveil Owner Panel</h1>
        <p>Server Owner Dashboard - Laszlo's Private Area</p>
        <button className="owner-logout-btn" onClick={handleOwnerLogout}>
          🚪 Logout
        </button>
      </div>

      <div className="owner-panel-content">
        {/* Tab Navigation */}
        <div className="owner-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button 
            className={`tab-btn ${activeTab === 'donations' ? 'active' : ''}`}
            onClick={() => setActiveTab('donations')}
          >
            🔄 Recurring Donations
          </button>
          <button 
            className={`tab-btn ${activeTab === 'server' ? 'active' : ''}`}
            onClick={() => setActiveTab('server')}
          >
            🖥️ Server Control
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Server Financial & Stats */}
            <div className="owner-section">
          <h2>💰 Revenue & Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card revenue">
              <h3>Total Revenue</h3>
              <p>${serverStats.totalRevenue}</p>
            </div>
            <div className="stat-card patrons">
              <h3>Active Patrons</h3>
              <p>{serverStats.activePatrons}</p>
            </div>
            <div className="stat-card players">
              <h3>Total Players</h3>
              <p>{serverStats.totalPlayers}</p>
            </div>
            <div className="stat-card new-players">
              <h3>New Today</h3>
              <p>{serverStats.newPlayersToday}</p>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="owner-section">
          <h2>🖥️ System Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <span>CPU Usage</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: `${systemMetrics.cpuUsage}%`}}></div>
                <span>{systemMetrics.cpuUsage}%</span>
              </div>
            </div>
            <div className="metric-item">
              <span>Memory Usage</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: `${systemMetrics.memoryUsage}%`}}></div>
                <span>{systemMetrics.memoryUsage}%</span>
              </div>
            </div>
            <div className="metric-item">
              <span>Disk Usage</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{width: `${systemMetrics.diskUsage}%`}}></div>
                <span>{systemMetrics.diskUsage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Activity Log */}
        <div className="owner-section">
          <h2>👤 Admin Activity Log</h2>
          <div className="admin-log">
            {adminLogs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-admin">{log.admin}</span>
                <span className="log-action">{log.action}</span>
                <span className="log-time">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Actions */}
        <div className="owner-section danger-zone">
          <h2>⚠️ Critical Server Actions</h2>
          <div className="critical-actions">
            <button className="critical-btn restart" onClick={handleServerRestart}>
              🔄 Restart Isle Server
            </button>
            <button className="critical-btn backup" onClick={handleDatabaseBackup}>
              💾 Manual Database Backup
            </button>
            <button className="critical-btn export" onClick={exportServerData}>
              📊 Export Server Data
            </button>
          </div>
        </div>

        {/* Server Information */}
        <div className="owner-section">
          <h2>🖥️ Server Information</h2>
          <div className="server-info">
            <div className="info-item">
              <strong>Server Uptime:</strong> {serverStats.serverUptime}
            </div>
            <div className="info-item">
              <strong>Database Size:</strong> {serverStats.databaseSize}
            </div>
            <div className="info-item">
              <strong>RCON Commands Today:</strong> {serverStats.rconCommands}
            </div>
            <div className="info-item">
              <strong>Backup Status:</strong> {serverStats.backupStatus}
            </div>
            <div className="info-item">
              <strong>Network In:</strong> {systemMetrics.networkIn}
            </div>
            <div className="info-item">
              <strong>Network Out:</strong> {systemMetrics.networkOut}
            </div>
          </div>
        </div>
          </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {/* Recurring Donations Tab */}
        {activeTab === 'donations' && (
          <RecurringDonations />
        )}

        {/* Server Control Tab */}
        {activeTab === 'server' && (
          <div className="server-control-wrapper">
            <ServerControlPanel />
          </div>
        )}


      </div>
    </div>
  );
}

export default OwnerPanel;