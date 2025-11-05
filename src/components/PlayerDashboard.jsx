import React, { useState, useEffect } from 'react';
import './PlayerDashboard.css';

const PlayerDashboard = () => {
    const [playerData, setPlayerData] = useState({
        steamId: '',
        playerName: '',
        isLoggedIn: false
    });
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [redeemCode, setRedeemCode] = useState('');
    const [targetPlayer, setTargetPlayer] = useState('');
    const [botStatus, setBotStatus] = useState({ connected: false });

    useEffect(() => {
        // Check bot status
        checkBotStatus();
        
        // TODO: Implement Steam authentication
        // For now, use placeholder data
        setPlayerData({
            steamId: '76561198123456789', // User's Steam ID
            playerName: 'PlayerName', // User's in-game name
            isLoggedIn: true
        });
    }, []);

    const checkBotStatus = async () => {
        try {
            const response = await fetch('/api/bot/status');
            const data = await response.json();
            setBotStatus(data);
        } catch (error) {
            console.error('Bot status check failed:', error);
        }
    };

    const executeCommand = async (endpoint, extraData = {}) => {
        if (!playerData.isLoggedIn) {
            setMessage('Please log in with Steam first');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    steamId: playerData.steamId,
                    playerName: playerData.playerName,
                    ...extraData
                })
            });

            const data = await response.json();
            
            if (data.success) {
                setMessage(`✅ ${data.message}`);
            } else {
                setMessage(`❌ ${data.error || 'Command failed'}`);
            }
        } catch (error) {
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSlayDino = () => {
        if (window.confirm('Are you sure you want to kill your dinosaur?')) {
            executeCommand('/api/player/slay');
        }
    };

    const handleParkDino = () => {
        executeCommand('/api/player/park');
    };

    const handleRedeemCode = () => {
        if (!redeemCode.trim()) {
            setMessage('Please enter a redemption code');
            return;
        }
        executeCommand('/api/player/redeem', { code: redeemCode });
        setRedeemCode('');
    };

    const handleTeleport = () => {
        if (!targetPlayer.trim()) {
            setMessage('Please enter target player name');
            return;
        }
        executeCommand('/api/player/teleport', { targetPlayer });
        setTargetPlayer('');
    };

    return (
        <div className="player-dashboard">
            <div className="dashboard-header">
                <h2>🦕 Player Dashboard</h2>
                <div className="bot-status">
                    Bot Status: <span className={botStatus.connected ? 'online' : 'offline'}>
                        {botStatus.connected ? '🟢 Online' : '🔴 Offline'}
                    </span>
                </div>
            </div>

            {!playerData.isLoggedIn ? (
                <div className="login-prompt">
                    <h3>Please log in with Steam to access player features</h3>
                    <button className="steam-login-btn">
                        🎮 Login with Steam
                    </button>
                </div>
            ) : (
                <div className="player-controls">
                    <div className="player-info">
                        <h3>Welcome, {playerData.playerName}!</h3>
                        <p>Steam ID: {playerData.steamId}</p>
                    </div>

                    <div className="command-grid">
                        <div className="command-card">
                            <h4>🔪 Kill My Dinosaur</h4>
                            <p>Instantly kill your current dinosaur</p>
                            <button 
                                onClick={handleSlayDino}
                                disabled={loading}
                                className="slay-btn"
                            >
                                {loading ? 'Slaying...' : 'Slay Dino'}
                            </button>
                        </div>

                        <div className="command-card">
                            <h4>🏠 Save My Dinosaur</h4>
                            <p>Park your dinosaur safely</p>
                            <button 
                                onClick={handleParkDino}
                                disabled={loading}
                                className="park-btn"
                            >
                                {loading ? 'Parking...' : 'Park Dino'}
                            </button>
                        </div>

                        <div className="command-card">
                            <h4>🎁 Redeem Code</h4>
                            <p>Use redemption codes for rewards</p>
                            <input
                                type="text"
                                placeholder="Enter redemption code"
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value)}
                            />
                            <button 
                                onClick={handleRedeemCode}
                                disabled={loading || !redeemCode.trim()}
                                className="redeem-btn"
                            >
                                {loading ? 'Redeeming...' : 'Redeem Code'}
                            </button>
                        </div>

                        <div className="command-card">
                            <h4>🚀 Teleport to Friend</h4>
                            <p>Quick travel to another player</p>
                            <input
                                type="text"
                                placeholder="Friend's player name"
                                value={targetPlayer}
                                onChange={(e) => setTargetPlayer(e.target.value)}
                            />
                            <button 
                                onClick={handleTeleport}
                                disabled={loading || !targetPlayer.trim()}
                                className="teleport-btn"
                            >
                                {loading ? 'Teleporting...' : 'Teleport'}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlayerDashboard;