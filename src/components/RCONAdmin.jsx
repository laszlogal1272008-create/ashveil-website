import React, { useState } from 'react';
import serverApi from '../services/serverApi';
import './RCONAdmin.css';

const RCONAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const ADMIN_PASSWORD = 'CookieMonster420'; // Same as RCON password

  const authenticate = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
      addToHistory('✅ Admin access granted', 'success');
    } else {
      addToHistory('❌ Invalid password', 'error');
      setPassword('');
    }
  };

  const addToHistory = (message, type = 'info') => {
    const entry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setCommandHistory(prev => [entry, ...prev.slice(0, 49)]); // Keep last 50 entries
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    setIsExecuting(true);
    addToHistory(`> ${command}`, 'command');

    try {
      const result = await serverApi.sendRCONCommand(command);
      if (result.success) {
        addToHistory(result.response, 'success');
      } else {
        addToHistory('Command failed', 'error');
      }
    } catch (error) {
      addToHistory(`Error: ${error.message}`, 'error');
    }

    setCommand('');
    setIsExecuting(false);
  };

  const quickCommands = [
    { label: 'List Players', command: 'listplayers' },
    { label: 'Save World', command: 'save' },
    { label: 'Server Announcement', command: 'announce Welcome to Ashveil!' },
    { label: 'Restart Warning', command: 'announce Server restart in 5 minutes!' },
    { label: 'Weather Storm', command: 'weather storm' },
    { label: 'Weather Clear', command: 'weather clear' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="rcon-admin">
        <div className="admin-login">
          <h3>🔒 RCON Admin Access</h3>
          <p>Enter the RCON password to access server administration:</p>
          <div className="login-form">
            <input
              type="password"
              placeholder="Enter RCON password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && authenticate()}
              className="password-input"
            />
            <button onClick={authenticate} className="login-btn">
              🔓 Authenticate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rcon-admin">
      <div className="admin-header">
        <h3>🛠️ RCON Server Administration</h3>
        <button 
          onClick={() => setIsAuthenticated(false)} 
          className="logout-btn"
        >
          🔒 Logout
        </button>
      </div>

      <div className="admin-content">
        <div className="command-section">
          <h4>RCON Command Console</h4>
          <div className="command-input-group">
            <input
              type="text"
              placeholder="Enter RCON command..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isExecuting && executeCommand()}
              className="command-input"
              disabled={isExecuting}
            />
            <button 
              onClick={executeCommand}
              disabled={isExecuting || !command.trim()}
              className="execute-btn"
            >
              {isExecuting ? '⏳ Executing...' : '▶ Execute'}
            </button>
          </div>

          <div className="quick-commands">
            <h5>Quick Commands</h5>
            <div className="quick-command-grid">
              {quickCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => setCommand(cmd.command)}
                  className="quick-cmd-btn"
                  disabled={isExecuting}
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="history-section">
          <h4>Command History</h4>
          <div className="command-history">
            {commandHistory.length === 0 ? (
              <div className="no-history">No commands executed yet</div>
            ) : (
              commandHistory.map((entry) => (
                <div key={entry.id} className={`history-entry ${entry.type}`}>
                  <span className="timestamp">[{entry.timestamp}]</span>
                  <span className="message">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="admin-info">
        <h4>Server Connection Info</h4>
        <div className="info-grid">
          <div className="info-item">
            <span>Server:</span>
            <span>45.45.238.134:16006</span>
          </div>
          <div className="info-item">
            <span>RCON Port:</span>
            <span>16007</span>
          </div>
          <div className="info-item">
            <span>Max Players:</span>
            <span>300</span>
          </div>
          <div className="info-item">
            <span>Game Mode:</span>
            <span>Survival (3X Growth)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RCONAdmin;