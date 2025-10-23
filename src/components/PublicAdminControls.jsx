import React, { useState, useEffect } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import './PublicAdminControls.css';

const PublicAdminControls = () => {
  const { 
    userRole, 
    playerName, 
    hasPermission, 
    canActOnPlayer, 
    setRole, 
    setPlayerIdentity 
  } = usePermissions();

  const [targetPlayer, setTargetPlayer] = useState('');
  const [userPlayerName, setUserPlayerName] = useState(playerName || '');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [destinationPlayer, setDestinationPlayer] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCommands, setPendingCommands] = useState([]);
  const [showCommands, setShowCommands] = useState(false);
  const [rolePassword, setRolePassword] = useState('');
  const [showRoleUpgrade, setShowRoleUpgrade] = useState(false);

  // Role passwords (in real app, these would be server-side verified)
  const rolePasswords = {
    owner: 'OwnerPass2024!',
    admin: 'AdminPass2024!',
    moderator: 'ModPass2024!'
  };

  // Update player identity when user changes name
  useEffect(() => {
    if (userPlayerName) {
      setPlayerIdentity(userPlayerName, 'steam_id_placeholder');
    }
  }, [userPlayerName, setPlayerIdentity]);

  // Set target player to self by default
  useEffect(() => {
    if (!targetPlayer && userPlayerName) {
      setTargetPlayer(userPlayerName);
    }
  }, [userPlayerName, targetPlayer]);

  // Fetch pending commands if user has permission
  const fetchPendingCommands = async () => {
    if (!hasPermission('canViewPendingCommands')) return;
    
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
    const interval = setInterval(fetchPendingCommands, 30000);
    return () => clearInterval(interval);
  }, [hasPermission]);

  const executeAdminCommand = async (endpoint, body) => {
    setLoading(true);
    setResponseMessage('');
    
    try {
      // First get the command from the admin API
      const adminResponse = await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...body,
          adminUser: userPlayerName || 'Anonymous'
        }),
      });
      
      const adminData = await adminResponse.json();
      
      if (adminData.success && adminData.command) {
        // Now execute the command automatically using the automation system
        const executionResponse = await fetch('/api/automation/execute-command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: adminData.command,
            playerId: body.targetPlayer || userPlayerName,
            type: 'admin',
            adminUser: userPlayerName || 'Anonymous'
          }),
        });

        const executionData = await executionResponse.json();

        if (executionData.success) {
          if (executionData.automaticExecution) {
            setResponseMessage(`✅ Command executed instantly! ${adminData.command} completed automatically.`);
          } else {
            setResponseMessage(`✅ Success: ${adminData.message || 'Command executed via backup system'}`);
          }
        } else {
          setResponseMessage(`✅ Command queued: ${adminData.message || 'Command will be executed shortly'}`);
        }
        
        fetchPendingCommands(); // Refresh pending commands
      } else {
        setResponseMessage(`❌ Error: ${adminData.error}`);
      }
    } catch (error) {
      setResponseMessage(`❌ Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpgrade = () => {
    const role = Object.keys(rolePasswords).find(r => rolePasswords[r] === rolePassword);
    if (role) {
      setRole(role);
      setResponseMessage(`✅ Role upgraded to ${role}!`);
      setRolePassword('');
      setShowRoleUpgrade(false);
    } else {
      setResponseMessage('❌ Invalid password');
    }
  };

  const handleSelfAction = (action) => {
    if (!userPlayerName) {
      setResponseMessage('❌ Please enter your player name first');
      return;
    }
    
    switch (action) {
      case 'slay':
        executeAdminCommand('slay', { targetPlayer: userPlayerName });
        break;
      case 'heal':
        executeAdminCommand('heal', { targetPlayer: userPlayerName });
        break;
      default:
        break;
    }
  };

  const handleAdminAction = (action) => {
    if (!targetPlayer) {
      setResponseMessage('❌ Please enter a target player name');
      return;
    }

    if (!canActOnPlayer({ name: targetPlayer }, action)) {
      setResponseMessage('❌ You do not have permission for this action');
      return;
    }

    switch (action) {
      case 'slay':
        executeAdminCommand('slay', { targetPlayer });
        break;
      case 'ban':
        executeAdminCommand('ban', { targetPlayer, reason });
        break;
      case 'kick':
        executeAdminCommand('kick', { targetPlayer, reason });
        break;
      case 'heal':
        executeAdminCommand('heal', { targetPlayer });
        break;
      case 'teleport':
        if (!destinationPlayer) {
          setResponseMessage('❌ Please enter destination player name');
          return;
        }
        executeAdminCommand('teleport', { targetPlayer, destinationPlayer });
        break;
      case 'message':
        if (!message) {
          setResponseMessage('❌ Please enter a message');
          return;
        }
        executeAdminCommand('message', { targetPlayer, message });
        break;
      default:
        break;
    }
  };

  const handleBroadcast = () => {
    if (!hasPermission('canBroadcast')) {
      setResponseMessage('❌ You do not have broadcast permission');
      return;
    }
    if (!message) {
      setResponseMessage('❌ Please enter a message');
      return;
    }
    executeAdminCommand('broadcast', { message });
  };

  return (
    <div className="public-admin-controls">
      <div className="admin-header">
        <h2>🎮 Server Controls</h2>
        <div className="role-info">
          <span className={`role-badge ${userRole}`}>
            {userRole.toUpperCase()}
          </span>
          <button 
            onClick={() => setShowRoleUpgrade(!showRoleUpgrade)}
            className="upgrade-btn"
          >
            Upgrade Role
          </button>
        </div>
      </div>

      {showRoleUpgrade && (
        <div className="role-upgrade-section">
          <h3>Role Upgrade</h3>
          <input
            type="password"
            placeholder="Enter role password"
            value={rolePassword}
            onChange={(e) => setRolePassword(e.target.value)}
            className="role-input"
          />
          <button onClick={handleRoleUpgrade} className="upgrade-submit-btn">
            Upgrade
          </button>
        </div>
      )}

      <div className="identity-section">
        <h3>Player Identity</h3>
        <input
          type="text"
          placeholder="Your in-game player name"
          value={userPlayerName}
          onChange={(e) => setUserPlayerName(e.target.value)}
          className="identity-input"
        />
      </div>

      {/* Self-Actions Available to All Players */}
      <div className="self-actions-section">
        <h3>🙋 Self Actions</h3>
        <p>Actions you can perform on yourself:</p>
        <div className="button-grid">
          <button 
            onClick={() => handleSelfAction('slay')} 
            disabled={loading || !userPlayerName} 
            className="self-btn slay-btn"
          >
            ⚔️ Slay Myself
          </button>
          <button 
            onClick={() => handleSelfAction('heal')} 
            disabled={loading || !userPlayerName} 
            className="self-btn heal-btn"
          >
            💚 Heal Myself
          </button>
        </div>
      </div>

      {/* Admin Actions - Only for users with permissions */}
      {(hasPermission('canSlayAnyPlayer') || hasPermission('canHealPlayers')) && (
        <div className="admin-section">
          <h3>👑 Admin Controls</h3>
          <input
            type="text"
            placeholder="Target Player Name"
            value={targetPlayer}
            onChange={(e) => setTargetPlayer(e.target.value)}
            className="admin-input"
          />

          <div className="button-grid">
            {hasPermission('canSlayAnyPlayer') && (
              <button 
                onClick={() => handleAdminAction('slay')} 
                disabled={loading} 
                className="admin-btn slay-btn"
              >
                ⚔️ Slay Player
              </button>
            )}
            
            {hasPermission('canHealPlayers') && (
              <button 
                onClick={() => handleAdminAction('heal')} 
                disabled={loading} 
                className="admin-btn heal-btn"
              >
                💚 Heal Player
              </button>
            )}

            {hasPermission('canKickPlayers') && (
              <button 
                onClick={() => handleAdminAction('kick')} 
                disabled={loading} 
                className="admin-btn kick-btn"
              >
                👢 Kick Player
              </button>
            )}

            {hasPermission('canBanPlayers') && (
              <button 
                onClick={() => handleAdminAction('ban')} 
                disabled={loading} 
                className="admin-btn ban-btn"
              >
                🚫 Ban Player
              </button>
            )}
          </div>

          {(hasPermission('canKickPlayers') || hasPermission('canBanPlayers')) && (
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="admin-input"
            />
          )}
        </div>
      )}

      {/* Communication */}
      {(hasPermission('canMessagePlayers') || hasPermission('canBroadcast')) && (
        <div className="admin-section">
          <h3>💬 Communication</h3>
          <input
            type="text"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="admin-input"
          />

          <div className="button-grid">
            {hasPermission('canMessagePlayers') && (
              <button 
                onClick={() => handleAdminAction('message')} 
                disabled={loading} 
                className="admin-btn message-btn"
              >
                💬 Send Message
              </button>
            )}

            {hasPermission('canBroadcast') && (
              <button 
                onClick={handleBroadcast} 
                disabled={loading} 
                className="admin-btn broadcast-btn"
              >
                📢 Broadcast
              </button>
            )}
          </div>
        </div>
      )}

      {/* Teleportation */}
      {hasPermission('canTeleportPlayers') && (
        <div className="admin-section">
          <h3>🌀 Teleportation</h3>
          <input
            type="text"
            placeholder="Destination Player Name"
            value={destinationPlayer}
            onChange={(e) => setDestinationPlayer(e.target.value)}
            className="admin-input"
          />
          <button 
            onClick={() => handleAdminAction('teleport')} 
            disabled={loading} 
            className="admin-btn teleport-btn"
          >
            🌀 Teleport Player
          </button>
        </div>
      )}

      {responseMessage && (
        <div className="response-message">
          {responseMessage}
        </div>
      )}

      {/* Pending Commands - Only for privileged users */}
      {hasPermission('canViewPendingCommands') && (
        <div className="pending-commands-section">
          <div className="commands-header">
            <h3>🎮 Pending Commands</h3>
            <button 
              onClick={() => setShowCommands(!showCommands)}
              className="toggle-btn"
            >
              {showCommands ? 'Hide' : 'Show'} ({pendingCommands.length})
            </button>
          </div>
          
          {showCommands && (
            <div className="pending-commands">
              <p><strong>For Server Owner:</strong> Copy these to your Physgun console:</p>
              
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
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">Processing...</div>
        </div>
      )}
    </div>
  );
};

export default PublicAdminControls;