import React, { useState, useEffect } from 'react';
import './AdminControls.css';

const AdminControls = () => {
  const [targetPlayer, setTargetPlayer] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [destinationPlayer, setDestinationPlayer] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCommands, setPendingCommands] = useState([]);
  const [showCommands, setShowCommands] = useState(false);

  // Fetch pending commands for manual execution
  const fetchPendingCommands = async () => {
    try {
      const response = await fetch('/api/admin/pending-commands');
      const data = await response.json();
      
      if (data.success) {
        setPendingCommands(data.commands);
      }
    } catch (error) {
      console.error('Error fetching pending commands:', error);
    }
  };

  useEffect(() => {
    fetchPendingCommands();
    const interval = setInterval(fetchPendingCommands, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const executeAdminCommand = async (endpoint, body) => {
    setLoading(true);
    setResponseMessage('');
    
    try {
      const response = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          adminUser: adminUser || 'Admin'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResponseMessage(`✅ Success: ${data.message || 'Command executed successfully'}`);
        fetchPendingCommands(); // Refresh pending commands
      } else {
        setResponseMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResponseMessage(`❌ Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSlay = () => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a player name');
      return;
    }
    executeAdminCommand('slay', { targetPlayer });
  };

  const handleBan = () => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a player name');
      return;
    }
    executeAdminCommand('ban', { targetPlayer, reason });
  };

  const handleKick = () => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a player name');
      return;
    }
    executeAdminCommand('kick', { targetPlayer, reason });
  };

  const handleTeleport = () => {
    if (!targetPlayer || !destinationPlayer) {
      setResponseMessage('❌ Please enter both player names');
      return;
    }
    executeAdminCommand('teleport', { targetPlayer, destinationPlayer });
  };

  const handleHeal = () => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a player name');
      return;
    }
    executeAdminCommand('heal', { targetPlayer });
  };

  const handleMessage = () => {
    if (!targetPlayer || !message) {
      setResponseMessage('❌ Please enter player name and message');
      return;
    }
    executeAdminCommand('message', { targetPlayer, message });
  };

  const handleBroadcast = () => {
    if (!message) {
      setResponseMessage('❌ Please enter a message');
      return;
    }
    executeAdminCommand('broadcast', { message });
  };

  const handleAddCurrency = async () => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a player name');
      return;
    }
    
    const amount = parseInt(prompt('Enter currency amount to add:'));
    if (!amount || amount <= 0) {
      setResponseMessage('❌ Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/currency/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetPlayer,
          amount,
          reason: reason || 'Admin grant',
          adminUser: adminUser || 'Admin'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResponseMessage(`✅ Added ${amount} currency to ${targetPlayer}. New balance: ${data.newBalance}`);
      } else {
        setResponseMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResponseMessage(`❌ Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-controls">
      <div className="admin-header">
        <h2>🛡️ Server Administration</h2>
        <p>Control any player on the server through Physgun console integration</p>
      </div>

      <div className="admin-section">
        <h3>Admin Identity</h3>
        <input
          type="text"
          placeholder="Your admin name (optional)"
          value={adminUser}
          onChange={(e) => setAdminUser(e.target.value)}
          className="admin-input"
        />
      </div>

      <div className="admin-section">
        <h3>Player Controls</h3>
        <input
          type="text"
          placeholder="Target Player Name"
          value={targetPlayer}
          onChange={(e) => setTargetPlayer(e.target.value)}
          className="admin-input"
        />
        
        <div className="button-grid">
          <button onClick={handleSlay} disabled={loading} className="admin-btn slay-btn">
            ⚔️ Slay Player
          </button>
          <button onClick={handleHeal} disabled={loading} className="admin-btn heal-btn">
            💚 Heal Player
          </button>
          <button onClick={handleAddCurrency} disabled={loading} className="admin-btn currency-btn">
            💰 Add Currency
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>Moderation</h3>
        <input
          type="text"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="admin-input"
        />
        
        <div className="button-grid">
          <button onClick={handleKick} disabled={loading} className="admin-btn kick-btn">
            👢 Kick Player
          </button>
          <button onClick={handleBan} disabled={loading} className="admin-btn ban-btn">
            🚫 Ban Player
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h3>Teleportation</h3>
        <input
          type="text"
          placeholder="Destination Player Name"
          value={destinationPlayer}
          onChange={(e) => setDestinationPlayer(e.target.value)}
          className="admin-input"
        />
        <button onClick={handleTeleport} disabled={loading} className="admin-btn teleport-btn">
          🌀 Teleport Player
        </button>
      </div>

      <div className="admin-section">
        <h3>Communication</h3>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="admin-input"
        />
        
        <div className="button-grid">
          <button onClick={handleMessage} disabled={loading} className="admin-btn message-btn">
            💬 Send Private Message
          </button>
          <button onClick={handleBroadcast} disabled={loading} className="admin-btn broadcast-btn">
            📢 Server Broadcast
          </button>
        </div>
      </div>

      {responseMessage && (
        <div className="response-message">
          {responseMessage}
        </div>
      )}

      <div className="pending-commands-section">
        <div className="commands-header">
          <h3>🎮 Physgun Console Commands</h3>
          <button 
            onClick={() => setShowCommands(!showCommands)}
            className="toggle-btn"
          >
            {showCommands ? 'Hide' : 'Show'} Commands ({pendingCommands.length})
          </button>
        </div>
        
        {showCommands && (
          <div className="pending-commands">
            <p><strong>Instructions:</strong> Copy these commands and paste them into your Physgun control panel console:</p>
            
            {pendingCommands.length > 0 ? (
              <div className="commands-list">
                {pendingCommands.map((cmd, index) => (
                  <div key={index} className="command-item">
                    <div className="command-info">
                      <strong>{cmd.commandType}</strong> → {cmd.targetPlayer}
                      <span className="command-time">{new Date(cmd.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="command-text">
                      <code>{cmd.command}</code>
                      <button 
                        onClick={() => navigator.clipboard.writeText(cmd.command)}
                        className="copy-btn"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-commands">No pending commands</p>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Processing...</div>
        </div>
      )}
    </div>
  );
};

export default AdminControls;