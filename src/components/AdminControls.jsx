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
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [showTesting, setShowTesting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [rapidTesting, setRapidTesting] = useState(false);

  // Test different RCON command syntaxes
  const testRCONCommand = async (command, playerName) => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const VPS_BRIDGE_URL = 'http://104.131.111.229:3001';
      
      // Use the enhanced slay endpoint with commandOverride
      const response = await fetch(`${VPS_BRIDGE_URL}/rcon/slay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName,
          commandOverride: command, // This should override the default 'slay'
          reason: `Testing ${command} command - ${timestamp}`
        }),
      });
      
      const data = await response.json();
      
      const result = {
        timestamp,
        command: `${command} ${playerName}`,
        success: data.success,
        response: data.message || data.response || data.error || 'No response',
        actualCommand: data.command || `${command} ${playerName}`,
        rawData: data
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 14)]); // Keep last 15 results
      
      if (data.success) {
        setResponseMessage(`🧪 TESTING: ${result.command} - ${result.response}`);
      } else {
        setResponseMessage(`❌ FAILED: ${result.command} - ${result.response}`);
      }
    } catch (error) {
      const result = {
        timestamp,
        command: `${command} ${playerName}`,
        success: false,
        response: `Network Error: ${error.message}`,
        rawData: null
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 14)]);
      setResponseMessage(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test using raw command endpoint
  const testRawCommand = async (command, playerName) => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const VPS_BRIDGE_URL = 'http://104.131.111.229:3001';
      const fullCommand = `${command} ${playerName}`;
      
      // Try the raw endpoint first
      const response = await fetch(`${VPS_BRIDGE_URL}/rcon/raw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: fullCommand,
          opcode: 0x02
        }),
      });
      
      const data = await response.json();
      
      const result = {
        timestamp,
        command: fullCommand,
        success: data.success,
        response: data.message || data.response || data.error || 'No response',
        method: 'raw endpoint',
        rawData: data
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 14)]);
      
      if (data.success) {
        setResponseMessage(`🎯 RAW COMMAND: ${result.command} - ${result.response}`);
      } else {
        setResponseMessage(`❌ RAW FAILED: ${result.command} - ${result.response}`);
      }
    } catch (error) {
      const result = {
        timestamp,
        command: `${command} ${playerName}`,
        success: false,
        response: `Network Error: ${error.message}`,
        method: 'raw endpoint (failed)',
        rawData: null
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 14)]);
      setResponseMessage(`❌ Raw endpoint error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Rapid test multiple RCON commands
  const rapidTestCommands = async () => {
    setRapidTesting(true);
    setResponseMessage('🔥 RAPID TESTING DIFFERENT RCON COMMANDS...');
    
    const playerName = targetPlayer || 'Misplacedcursor';
    const commands = [
      'kill',
      'murder', 
      'admin_kill',
      'slaughter',
      'destroy',
      'eliminate',
      'AdminKill',
      'KillPlayer',
      'PlayerKill',
      'slay',
      'admin_slay'
    ];
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      setResponseMessage(`🧪 Testing ${i + 1}/${commands.length}: ${command} ${playerName}`);
      
      await testRCONCommand(command, playerName);
      
      // Wait 2 seconds between tests
      if (i < commands.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    setRapidTesting(false);
    setResponseMessage('🎯 RAPID TEST COMPLETE! Check results below for any that worked!');
  };

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

  // Fetch online players - simplified approach
  const fetchOnlinePlayers = async () => {
    setResponseMessage('📝 Manual player entry required - Add known player names below');
    setOnlinePlayers([
      { name: 'Misplacedcursor', steamId: '76561199520399511', rawLine: 'Known test player' },
      { name: 'TestPlayer1', steamId: null, rawLine: 'Example player name' },
      { name: 'TestPlayer2', steamId: null, rawLine: 'Example player name' }
    ]);
  };

  // Parse player list response into array
  const parsePlayerList = (playerInfo) => {
    if (!playerInfo) return [];
    
    // Common patterns in Isle player lists
    const lines = playerInfo.split('\n');
    const players = [];
    
    lines.forEach(line => {
      // Look for patterns like "PlayerName (SteamID)" or just player names
      const playerMatch = line.match(/([A-Za-z0-9_\-\.]+)/);
      if (playerMatch && playerMatch[1] && playerMatch[1] !== 'Players' && playerMatch[1] !== 'Online') {
        players.push({
          name: playerMatch[1],
          steamId: line.match(/\((\d+)\)/) ? line.match(/\((\d+)\)/)[1] : null,
          rawLine: line.trim()
        });
      }
    });
    
    return players;
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
      // Use the working VPS RCON bridge instead of broken backend API
      const VPS_BRIDGE_URL = 'http://104.131.111.229:3001';
      const response = await fetch(`${VPS_BRIDGE_URL}/rcon/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: body.targetPlayer,
          reason: `Admin command from ${body.adminUser || 'Admin'}`
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

  // Test different command formats using the working slay endpoint
  const testCommandFormat = async (commandType, playerName) => {
    setLoading(true);
    const timestamp = new Date().toLocaleTimeString();
    
    try {
      const VPS_BRIDGE_URL = 'http://104.131.111.229:3001';
      
      // Use the working slay endpoint but test different player name formats
      const response = await fetch(`${VPS_BRIDGE_URL}/rcon/slay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: playerName,
          reason: `Testing ${commandType} format - ${timestamp}`
        }),
      });
      
      const data = await response.json();
      
      const result = {
        timestamp,
        command: `${commandType} ${playerName}`,
        success: data.success,
        response: data.message || data.response || data.error || 'No response',
        rawData: data,
        note: `Using slay endpoint with ${commandType} approach`
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      
      if (data.success) {
        setResponseMessage(`🧪 Test sent: ${result.command} - Response: ${result.response}`);
      } else {
        setResponseMessage(`❌ Test failed: ${result.command} - Error: ${result.response}`);
      }
    } catch (error) {
      const result = {
        timestamp,
        command: `${commandType} ${playerName}`,
        success: false,
        response: `Network Error: ${error.message}`,
        rawData: null
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]);
      setResponseMessage(`❌ Test network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSlay = () => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a player name');
      return;
    }
    
    // Show what command is being sent
    setResponseMessage(`🔄 Sending slay command to: ${targetPlayer}`);
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
        <h3>🎯 Online Players</h3>
        <button onClick={fetchOnlinePlayers} disabled={loading} className="admin-btn refresh-btn">
          🔄 Refresh Player List
        </button>
        
        {onlinePlayers.length > 0 && (
          <div className="players-list">
            <h4>Currently Online ({onlinePlayers.length}):</h4>
            {onlinePlayers.map((player, index) => (
              <div key={index} className="player-item">
                <span className="player-name">{player.name}</span>
                {player.steamId && <span className="player-steam">({player.steamId})</span>}
                <button 
                  onClick={() => setTargetPlayer(player.name)}
                  className="select-player-btn"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3>🧪 Command Format Testing</h3>
        <button 
          onClick={() => setShowTesting(!showTesting)}
          className="toggle-btn"
        >
          {showTesting ? 'Hide' : 'Show'} Testing Panel
        </button>
        
        {showTesting && (
          <div className="testing-panel">
            <p><strong>🔥 COMMAND SYNTAX TESTING</strong></p>
            <p>Since player name formats didn't work, let's test different RCON commands!</p>
            
            {!targetPlayer && (
              <p className="warning">⚠️ Please enter a target player first</p>
            )}
            
            <div className="rapid-test-section">
              <button 
                onClick={rapidTestCommands}
                disabled={loading || rapidTesting || !targetPlayer}
                className="rapid-test-btn"
              >
                {rapidTesting ? '🔄 TESTING...' : '🚀 RAPID TEST ALL COMMANDS'}
              </button>
              <p className="rapid-test-info">
                This will test: kill, murder, admin_kill, slaughter, destroy, eliminate, AdminKill, KillPlayer, PlayerKill, slay, admin_slay
              </p>
            </div>
            
            <div className="individual-tests">
              <h5>Or test individual commands:</h5>
              <div className="test-buttons">
                <button 
                  onClick={() => testRCONCommand('kill', targetPlayer)}
                  disabled={loading || !targetPlayer}
                  className="test-btn priority"
                >
                  Test: kill {targetPlayer}
                </button>
                
                <button 
                  onClick={() => testRCONCommand('murder', targetPlayer)}
                  disabled={loading || !targetPlayer}
                  className="test-btn priority"
                >
                  Test: murder {targetPlayer}
                </button>
                
                <button 
                  onClick={() => testRCONCommand('admin_kill', targetPlayer)}
                  disabled={loading || !targetPlayer}
                  className="test-btn priority"
                >
                  Test: admin_kill {targetPlayer}
                </button>
                
                <button 
                  onClick={() => testRCONCommand('slaughter', targetPlayer)}
                  disabled={loading || !targetPlayer}
                  className="test-btn"
                >
                  Test: slaughter {targetPlayer}
                </button>
                
                <button 
                  onClick={() => testRCONCommand('AdminKill', targetPlayer)}
                  disabled={loading || !targetPlayer}
                  className="test-btn"
                >
                  Test: AdminKill {targetPlayer}
                </button>
                
                <button 
                  onClick={() => testRCONCommand('KillPlayer', targetPlayer)}
                  disabled={loading || !targetPlayer}
                  className="test-btn"
                >
                  Test: KillPlayer {targetPlayer}
                </button>
              </div>
            </div>
            
            {testResults.length > 0 && (
              <div className="test-results">
                <h4>Recent Test Results:</h4>
                {testResults.map((result, index) => (
                  <div key={index} className={`test-result ${result.success ? 'success' : 'error'}`}>
                    <div className="result-header">
                      <span className="result-time">{result.timestamp}</span>
                      <span className={`result-status ${result.success ? 'success' : 'error'}`}>
                        {result.success ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="result-command">
                      <strong>Command:</strong> <code>{result.command}</code>
                    </div>
                    <div className="result-response">
                      <strong>Response:</strong> {result.response}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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