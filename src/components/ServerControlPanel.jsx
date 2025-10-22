import React, { useState, useEffect } from 'react';
import './ServerControlPanel.css';

function ServerControlPanel() {
  const [serverStatus, setServerStatus] = useState({
    online: false,
    playerCount: 0,
    maxPlayers: 100,
    isConnected: false,
    scheduledTasks: [],
    performance: 'unknown',
    uptime: '0h 0m',
    lastRestart: null
  });
  const [players, setPlayers] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [commandInput, setCommandInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    type: 'daily',
    time: '04:00',
    reason: 'Scheduled maintenance restart'
  });

  // Enhanced Broadcast System State
  const [customMessage, setCustomMessage] = useState('');
  const [announcementStyle, setAnnouncementStyle] = useState('normal');
  const [priorityLevel, setPriorityLevel] = useState('low');
  const [includeTimestamp, setIncludeTimestamp] = useState(false);
  const [useUppercase, setUseUppercase] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(5);
  const [repeatInterval, setRepeatInterval] = useState('none');
  const [broadcastHistory, setBroadcastHistory] = useState([]);

  // Auto-refresh server status every 30 seconds
  useEffect(() => {
    fetchServerStatus();
    fetchPlayers();
    fetchConsoleOutput();
    
    const interval = setInterval(() => {
      fetchServerStatus();
      fetchPlayers();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchServerStatus = async () => {
    try {
      const response = await fetch('/api/owner/server/status');
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data);
      } else {
        throw new Error('Failed to fetch server status');
      }
    } catch (error) {
      console.error('Error fetching server status:', error);
      setError('Failed to connect to server');
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/owner/server/players');
      if (response.ok) {
        const data = await response.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchConsoleOutput = async () => {
    try {
      const response = await fetch('/api/owner/server/logs?limit=50');
      if (response.ok) {
        const data = await response.json();
        setConsoleOutput(data.slice(0, 10)); // Show last 10 entries
      }
    } catch (error) {
      console.error('Error fetching console output:', error);
    }
  };

  const executeCommand = async (command) => {
    if (!command.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/owner/server/rcon-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Add command and response to console output
        const newOutput = [
          {
            timestamp: new Date().toISOString(),
            action: 'RCON_COMMAND',
            details: command,
            response: result.response
          },
          ...consoleOutput.slice(0, 9)
        ];
        setConsoleOutput(newOutput);
        
        setCommandInput('');
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Command failed');
      }
    } catch (error) {
      console.error('Error executing command:', error);
      setError('Failed to execute command');
    } finally {
      setLoading(false);
    }
  };

  const handleServerAction = async (action, data = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/owner/server/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Show success message
        const newOutput = [
          {
            timestamp: new Date().toISOString(),
            action: action.toUpperCase(),
            details: data.reason || `${action} executed`,
            response: result.message || 'Success'
          },
          ...consoleOutput.slice(0, 9)
        ];
        setConsoleOutput(newOutput);
        
        // Refresh status after action
        setTimeout(fetchServerStatus, 2000);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `${action} failed`);
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      setError(`Failed to execute ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKickPlayer = async (playerName) => {
    if (window.confirm(`Are you sure you want to kick ${playerName}?`)) {
      await handleServerAction('kick-player', { 
        playerName, 
        reason: 'Kicked by server administrator' 
      });
      fetchPlayers(); // Refresh player list
    }
  };

  const handleScheduleRestart = async () => {
    let cronExpression = '';
    
    switch (scheduleForm.type) {
      case 'daily':
        const [hour, minute] = scheduleForm.time.split(':');
        cronExpression = `${minute} ${hour} * * *`;
        break;
      case 'weekly':
        const [weekHour, weekMinute] = scheduleForm.time.split(':');
        cronExpression = `${weekMinute} ${weekHour} * * 0`; // Sunday
        break;
      case 'custom':
        cronExpression = scheduleForm.cronExpression;
        break;
      default:
        return;
    }
    
    try {
      const response = await fetch('/api/owner/server/schedule-restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cronExpression,
          reason: scheduleForm.reason
        })
      });
      
      if (response.ok) {
        setScheduleModal(false);
        fetchServerStatus();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to schedule restart');
      }
    } catch (error) {
      console.error('Error scheduling restart:', error);
      setError('Failed to schedule restart');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIndicator = () => {
    if (!serverStatus.isConnected) return '🔴 DISCONNECTED';
    if (serverStatus.online) return '🟢 ONLINE';
    return '🟡 CONNECTING';
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'performance-excellent';
      case 'good': return 'performance-good';
      case 'poor': return 'performance-poor';
      case 'critical': return 'performance-critical';
      default: return 'performance-unknown';
    }
  };

  // Enhanced Broadcast Functions
  const getStyleIcon = (style) => {
    const icons = {
      normal: '📢',
      important: '⚠️',
      celebration: '🎉',
      warning: '🚨',
      info: 'ℹ️',
      admin: '👑'
    };
    return icons[style] || '📢';
  };

  const formatAnnouncementPreview = () => {
    if (!customMessage.trim()) return 'Enter a message to see preview...';
    
    let message = customMessage;
    if (useUppercase) message = message.toUpperCase();
    
    let formattedMessage = `${getStyleIcon(announcementStyle)} ${message}`;
    
    if (includeTimestamp) {
      const timestamp = new Date().toLocaleTimeString();
      formattedMessage = `[${timestamp}] ${formattedMessage}`;
    }
    
    return formattedMessage;
  };

  const addToBroadcastHistory = (message) => {
    const historyItem = {
      message: message,
      timestamp: new Date().toISOString(),
      style: announcementStyle
    };
    setBroadcastHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20
  };

  const sendCustomAnnouncement = async () => {
    if (!customMessage.trim()) return;
    
    const formattedMessage = formatAnnouncementPreview();
    
    // Send based on priority level
    const broadcasts = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 5
    };
    
    const count = broadcasts[priorityLevel];
    
    try {
      for (let i = 0; i < count; i++) {
        await executeCommand(`broadcast ${formattedMessage}`);
        if (i < count - 1) {
          // Small delay between multiple broadcasts
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      addToBroadcastHistory(formattedMessage);
      
      // Clear message after sending
      setCustomMessage('');
      
    } catch (error) {
      console.error('Error sending custom announcement:', error);
      setError('Failed to send announcement');
    }
  };

  const scheduleDelayedBroadcast = () => {
    if (!customMessage.trim()) return;
    
    const formattedMessage = formatAnnouncementPreview();
    const delayMs = delayMinutes * 60 * 1000;
    
    // Show confirmation
    const confirmMessage = `Schedule broadcast in ${delayMinutes} minute(s)?\n\nMessage: "${formattedMessage}"`;
    
    if (window.confirm(confirmMessage)) {
      setTimeout(async () => {
        try {
          await executeCommand(`broadcast ${formattedMessage}`);
          addToBroadcastHistory(`[SCHEDULED] ${formattedMessage}`);
        } catch (error) {
          console.error('Error sending scheduled broadcast:', error);
        }
      }, delayMs);
      
      // Show success message
      const newOutput = [
        {
          timestamp: new Date().toISOString(),
          action: 'SCHEDULED_BROADCAST',
          details: `Broadcast scheduled for ${delayMinutes} minute(s)`,
          response: formattedMessage
        },
        ...consoleOutput.slice(0, 9)
      ];
      setConsoleOutput(newOutput);
      
      setCustomMessage('');
    }
  };

  const setupRepeatingBroadcast = () => {
    if (!customMessage.trim() || repeatInterval === 'none') return;
    
    const formattedMessage = formatAnnouncementPreview();
    const intervalMs = parseInt(repeatInterval) * 60 * 1000;
    
    const confirmMessage = `Start repeating broadcast every ${repeatInterval} minute(s)?\n\nMessage: "${formattedMessage}"\n\nNote: This will continue until you refresh the page.`;
    
    if (window.confirm(confirmMessage)) {
      // Send initial broadcast
      executeCommand(`broadcast ${formattedMessage}`);
      addToBroadcastHistory(`[REPEATING] ${formattedMessage}`);
      
      // Set up interval
      const intervalId = setInterval(async () => {
        try {
          await executeCommand(`broadcast ${formattedMessage}`);
        } catch (error) {
          console.error('Error sending repeating broadcast:', error);
          clearInterval(intervalId);
        }
      }, intervalMs);
      
      // Show success message
      const newOutput = [
        {
          timestamp: new Date().toISOString(),
          action: 'REPEATING_BROADCAST_STARTED',
          details: `Repeating every ${repeatInterval} minute(s)`,
          response: formattedMessage
        },
        ...consoleOutput.slice(0, 9)
      ];
      setConsoleOutput(newOutput);
      
      setCustomMessage('');
      setRepeatInterval('none');
    }
  };

  return (
    <div className="server-control-panel">
      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Real-Time Server Status */}
      <div className="owner-section">
        <h2>🖥️ Live Server Status</h2>
        <div className="server-status-grid">
          <div className={`status-card ${serverStatus.online ? 'online' : 'offline'}`}>
            <h3>Server Status</h3>
            <p className="status-indicator">{getStatusIndicator()}</p>
            <span>Uptime: {serverStatus.uptime}</span>
          </div>
          
          <div className="status-card">
            <h3>Current Players</h3>
            <p className="player-count">{serverStatus.playerCount}/{serverStatus.maxPlayers}</p>
            <span>Active Connections</span>
          </div>
          
          <div className="status-card">
            <h3>Server Performance</h3>
            <p className={`performance ${getPerformanceColor(serverStatus.performance)}`}>
              {serverStatus.performance.toUpperCase()}
            </p>
            <span>RCON: {serverStatus.isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <div className="status-card">
            <h3>Scheduled Tasks</h3>
            <p className="schedule-count">{serverStatus.scheduledTasks.length} active</p>
            <span>Last restart: {serverStatus.lastRestart ? new Date(serverStatus.lastRestart).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>
      </div>

      {/* RCON Command Console */}
      <div className="owner-section">
        <h2>⌨️ RCON Command Console</h2>
        <div className="rcon-console">
          <div className="console-output">
            {consoleOutput.length === 0 ? (
              <div className="console-line">Console ready - execute commands below</div>
            ) : (
              consoleOutput.map((log, index) => (
                <div key={index} className={`console-line ${log.action === 'RCON_COMMAND' ? 'command-sent' : 'response'}`}>
                  [{formatTimestamp(log.timestamp)}] {log.action}: {log.details}
                  {log.response && (
                    <div className="console-response">↳ {log.response}</div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="console-input-area">
            <input 
              type="text" 
              placeholder="Enter RCON command..." 
              className="console-input"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && executeCommand(commandInput)}
              disabled={loading || !serverStatus.isConnected}
            />
            <button 
              className="send-command-btn" 
              onClick={() => executeCommand(commandInput)}
              disabled={loading || !serverStatus.isConnected}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
          
          <div className="quick-commands">
            <button className="quick-cmd" onClick={() => executeCommand('save')}>save</button>
            <button className="quick-cmd" onClick={() => executeCommand('listplayers')}>listplayers</button>
            <button className="quick-cmd" onClick={() => executeCommand('broadcast Welcome to Ashveil!')}>broadcast</button>
            <button className="quick-cmd" onClick={() => executeCommand('weather clear')}>clear weather</button>
            <button className="quick-cmd" onClick={() => executeCommand('time 12:00')}>set noon</button>
          </div>
        </div>
      </div>

      {/* Server Management Controls */}
      <div className="owner-section">
        <h2>🔧 Server Management</h2>
        <div className="management-grid">
          <div className="management-card">
            <h4>🔄 Server Restart</h4>
            <p>Graceful restart with player warnings</p>
            <div className="management-actions">
              <button 
                className="action-btn restart-btn"
                onClick={() => handleServerAction('restart', { reason: 'Manual restart by owner' })}
                disabled={loading || !serverStatus.isConnected}
              >
                {loading ? 'Restarting...' : 'Restart Server'}
              </button>
              <button 
                className="action-btn schedule-btn"
                onClick={() => setScheduleModal(true)}
              >
                Schedule Restart
              </button>
            </div>
          </div>

          <div className="management-card">
            <h4>🛑 Server Shutdown</h4>
            <p>Complete server shutdown</p>
            <div className="management-actions">
              <button 
                className="action-btn shutdown-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to shutdown the server?')) {
                    handleServerAction('shutdown', { reason: 'Manual shutdown by owner' });
                  }
                }}
                disabled={loading || !serverStatus.isConnected}
              >
                Shutdown Server
              </button>
            </div>
          </div>

          <div className="management-card">
            <h4>🔧 Maintenance Mode</h4>
            <p>Enable/disable maintenance mode</p>
            <div className="management-actions">
              <button 
                className={`action-btn ${maintenanceMode ? 'disable-btn' : 'enable-btn'}`}
                onClick={() => {
                  const action = maintenanceMode ? 'maintenance/disable' : 'maintenance/enable';
                  handleServerAction(action);
                  setMaintenanceMode(!maintenanceMode);
                }}
                disabled={loading || !serverStatus.isConnected}
              >
                {maintenanceMode ? 'Disable' : 'Enable'} Maintenance
              </button>
            </div>
          </div>

          <div className="management-card">
            <h4>👥 Player Management</h4>
            <p>Kick all players from server</p>
            <div className="management-actions">
              <button 
                className="action-btn kick-all-btn"
                onClick={() => {
                  if (window.confirm('Are you sure you want to kick all players?')) {
                    handleServerAction('kick-all', { reason: 'Server maintenance' });
                  }
                }}
                disabled={loading || !serverStatus.isConnected}
              >
                Kick All Players
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="owner-section danger-zone">
        <h2>🚨 Emergency Controls</h2>
        <div className="emergency-grid">
          <button 
            className="emergency-btn shutdown"
            onClick={() => {
              if (window.confirm('EMERGENCY SHUTDOWN: This will immediately shutdown the server without warnings!')) {
                handleServerAction('emergency/shutdown');
              }
            }}
            disabled={loading || !serverStatus.isConnected}
          >
            🛑 Emergency Shutdown
          </button>
          
          <button 
            className="emergency-btn force-restart"
            onClick={() => {
              if (window.confirm('EMERGENCY RESTART: This will immediately restart the server with minimal warning!')) {
                handleServerAction('emergency/restart');
              }
            }}
            disabled={loading || !serverStatus.isConnected}
          >
            ⚡ Emergency Restart
          </button>
        </div>
        
        <div className="emergency-warning">
          ⚠️ Emergency controls will immediately affect all players. Use with extreme caution!
        </div>
      </div>

      {/* Active Players Management */}
      <div className="owner-section">
        <h2>👥 Active Players Control</h2>
        <div className="players-header">
          <span>Currently Online: {players.length}</span>
          <button className="refresh-btn" onClick={fetchPlayers}>
            🔄 Refresh
          </button>
        </div>
        
        <div className="active-players-list">
          {players.length === 0 ? (
            <div className="no-players">No players currently online</div>
          ) : (
            players.map((player, index) => (
              <div key={index} className="player-row">
                <span className="player-name">{player.name}</span>
                <span className="player-id">ID: {player.id}</span>
                <span className="player-status">
                  {player.connected ? '🟢 Online' : '🔴 Offline'}
                </span>
                <div className="player-actions">
                  <button 
                    className="msg-btn"
                    onClick={() => {
                      const message = prompt(`Send message to ${player.name}:`);
                      if (message) {
                        executeCommand(`message "${player.name}" "${message}"`);
                      }
                    }}
                    disabled={!player.connected}
                  >
                    💬 MSG
                  </button>
                  <button 
                    className="kick-btn"
                    onClick={() => handleKickPlayer(player.name)}
                    disabled={!player.connected}
                  >
                    ❌ Kick
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Server Broadcast */}
      <div className="owner-section">
        <h2>📢 Server Broadcast System</h2>
        
        {/* Quick Announcement Templates */}
        <div className="announcement-templates">
          <h4>Quick Announcements</h4>
          <div className="template-grid">
            <button 
              className="template-btn welcome"
              onClick={() => executeCommand('broadcast 🌟 Welcome to Ashveil! Enjoy your stay and follow server rules!')}
              disabled={loading || !serverStatus.isConnected}
            >
              🌟 Welcome Message
            </button>
            <button 
              className="template-btn restart"
              onClick={() => executeCommand('broadcast ⚠️ Server restart in 30 minutes! Please find a safe location.')}
              disabled={loading || !serverStatus.isConnected}
            >
              ⚠️ Restart Warning
            </button>
            <button 
              className="template-btn event"
              onClick={() => executeCommand('broadcast 🎉 Special event starting now! Check the website for details!')}
              disabled={loading || !serverStatus.isConnected}
            >
              🎉 Event Alert
            </button>
            <button 
              className="template-btn rules"
              onClick={() => executeCommand('broadcast 📋 Reminder: Please follow server rules. Visit our website for full guidelines.')}
              disabled={loading || !serverStatus.isConnected}
            >
              📋 Rules Reminder
            </button>
            <button 
              className="template-btn maintenance"
              onClick={() => executeCommand('broadcast 🔧 Server maintenance in progress. Thank you for your patience!')}
              disabled={loading || !serverStatus.isConnected}
            >
              🔧 Maintenance
            </button>
            <button 
              className="template-btn donation"
              onClick={() => executeCommand('broadcast 💎 Support the server! Visit our website for donation options and rewards!')}
              disabled={loading || !serverStatus.isConnected}
            >
              💎 Donation Appeal
            </button>
          </div>
        </div>

        {/* Custom Announcement Builder */}
        <div className="announcement-builder">
          <h4>Custom Announcement Builder</h4>
          
          <div className="builder-controls">
            <div className="control-row">
              <div className="control-group">
                <label>Message Style:</label>
                <select 
                  value={announcementStyle} 
                  onChange={(e) => setAnnouncementStyle(e.target.value)}
                  className="style-select"
                >
                  <option value="normal">📢 Normal</option>
                  <option value="important">⚠️ Important</option>
                  <option value="celebration">🎉 Celebration</option>
                  <option value="warning">🚨 Warning</option>
                  <option value="info">ℹ️ Information</option>
                  <option value="admin">👑 Admin Message</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>Priority Level:</label>
                <select 
                  value={priorityLevel} 
                  onChange={(e) => setPriorityLevel(e.target.value)}
                  className="priority-select"
                >
                  <option value="low">Low (1 broadcast)</option>
                  <option value="medium">Medium (2 broadcasts)</option>
                  <option value="high">High (3 broadcasts)</option>
                  <option value="urgent">Urgent (5 broadcasts)</option>
                </select>
              </div>
            </div>

            <div className="control-row">
              <div className="control-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={includeTimestamp}
                    onChange={(e) => setIncludeTimestamp(e.target.checked)}
                  />
                  Include Timestamp
                </label>
              </div>
              
              <div className="control-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={useUppercase}
                    onChange={(e) => setUseUppercase(e.target.checked)}
                  />
                  UPPERCASE MESSAGE
                </label>
              </div>
            </div>
          </div>

          <div className="message-composer">
            <textarea 
              placeholder="Enter your custom announcement message..."
              className="announcement-textarea"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={200}
            />
            <div className="character-count">
              {customMessage.length}/200 characters
            </div>
          </div>

          <div className="message-preview">
            <h5>Preview:</h5>
            <div className={`preview-message ${announcementStyle}`}>
              {formatAnnouncementPreview()}
            </div>
          </div>

          <div className="broadcast-actions">
            <button 
              className="broadcast-custom-btn"
              onClick={sendCustomAnnouncement}
              disabled={loading || !serverStatus.isConnected || !customMessage.trim()}
            >
              📢 Send Custom Broadcast
            </button>
            <button 
              className="clear-btn"
              onClick={() => {
                setCustomMessage('');
                setAnnouncementStyle('normal');
                setPriorityLevel('low');
                setIncludeTimestamp(false);
                setUseUppercase(false);
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Advanced Broadcast Options */}
        <div className="advanced-broadcast">
          <h4>Advanced Options</h4>
          
          <div className="advanced-controls">
            <div className="control-group">
              <label>Delayed Broadcast:</label>
              <div className="delay-controls">
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 1)}
                  className="delay-input"
                />
                <span>minutes</span>
                <button 
                  className="schedule-broadcast-btn"
                  onClick={scheduleDelayedBroadcast}
                  disabled={loading || !serverStatus.isConnected || !customMessage.trim()}
                >
                  ⏰ Schedule
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Repeating Broadcast:</label>
              <div className="repeat-controls">
                <select 
                  value={repeatInterval} 
                  onChange={(e) => setRepeatInterval(e.target.value)}
                  className="repeat-select"
                >
                  <option value="none">No Repeat</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="10">Every 10 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                </select>
                <button 
                  className="repeat-broadcast-btn"
                  onClick={setupRepeatingBroadcast}
                  disabled={loading || !serverStatus.isConnected || !customMessage.trim() || repeatInterval === 'none'}
                >
                  🔄 Start Repeating
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="broadcast-history">
          <h4>Recent Broadcasts</h4>
          <div className="history-list">
            {broadcastHistory.length === 0 ? (
              <div className="no-history">No recent broadcasts</div>
            ) : (
              broadcastHistory.slice(0, 5).map((broadcast, index) => (
                <div key={index} className="history-item">
                  <div className="history-timestamp">
                    {new Date(broadcast.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="history-message">{broadcast.message}</div>
                  <button 
                    className="repeat-btn"
                    onClick={() => executeCommand(`broadcast ${broadcast.message}`)}
                    disabled={loading || !serverStatus.isConnected}
                    title="Send this broadcast again"
                  >
                    🔁
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {scheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Schedule Server Restart</h3>
            
            <div className="form-group">
              <label>Schedule Type:</label>
              <select 
                value={scheduleForm.type} 
                onChange={(e) => setScheduleForm({...scheduleForm, type: e.target.value})}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly (Sunday)</option>
                <option value="custom">Custom Cron</option>
              </select>
            </div>

            {scheduleForm.type !== 'custom' && (
              <div className="form-group">
                <label>Time:</label>
                <input 
                  type="time" 
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                />
              </div>
            )}

            {scheduleForm.type === 'custom' && (
              <div className="form-group">
                <label>Cron Expression:</label>
                <input 
                  type="text" 
                  placeholder="0 4 * * *"
                  value={scheduleForm.cronExpression || ''}
                  onChange={(e) => setScheduleForm({...scheduleForm, cronExpression: e.target.value})}
                />
                <small>Example: "0 4 * * *" = Daily at 4:00 AM</small>
              </div>
            )}

            <div className="form-group">
              <label>Reason:</label>
              <input 
                type="text" 
                value={scheduleForm.reason}
                onChange={(e) => setScheduleForm({...scheduleForm, reason: e.target.value})}
                placeholder="Scheduled maintenance restart"
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setScheduleModal(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleScheduleRestart} className="confirm-btn">
                Schedule Restart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServerControlPanel;