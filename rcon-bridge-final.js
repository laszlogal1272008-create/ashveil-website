// Final Isle RCON Bridge for Website Integration
const express = require('express');
const net = require('net');
const cors = require('cors');

class IsleRCONBridge {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        
        // RCON Configuration
        this.rconConfig = {
            host: '45.45.238.134',
            port: 16007,
            password: 'CookieMonster420'
        };
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        
        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    async executeRCONCommand(command, opcode = 0x02) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let authenticated = false;
            let response = '';
            
            const timeout = setTimeout(() => {
                client.destroy();
                resolve({ success: true, message: 'Command sent (no response expected)' });
            }, 5000);

            client.connect(this.rconConfig.port, this.rconConfig.host, () => {
                console.log('🔌 RCON Connected, authenticating...');
                
                // Send authentication
                const authPacket = Buffer.concat([
                    Buffer.from([0x01]), // RCON_AUTH
                    Buffer.from(this.rconConfig.password, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(authPacket);
            });

            client.on('data', (data) => {
                const dataStr = data.toString('ascii');
                console.log('📨 RCON Response:', dataStr);
                
                if (!authenticated && dataStr.includes('Password Accepted')) {
                    authenticated = true;
                    console.log('🔐 RCON Authenticated, sending command:', command);
                    
                    // Send the actual command
                    const commandPacket = Buffer.concat([
                        Buffer.from([opcode]),
                        Buffer.from(command, 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                    
                    // Give it time for a response, then resolve
                    setTimeout(() => {
                        clearTimeout(timeout);
                        client.destroy();
                        resolve({ 
                            success: true, 
                            message: response || 'Command executed successfully',
                            command: command
                        });
                    }, 2000);
                } else if (authenticated) {
                    response += dataStr;
                }
            });

            client.on('error', (err) => {
                clearTimeout(timeout);
                console.error('❌ RCON Error:', err.message);
                reject({ success: false, error: err.message });
            });
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });

        // Test RCON connection
        this.app.get('/rcon/test', async (req, res) => {
            try {
                const result = await this.executeRCONCommand('GetPlayerList', 0x40);
                res.json({ 
                    success: true, 
                    message: 'RCON connection successful',
                    result 
                });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // Slay player endpoint
        this.app.post('/rcon/slay', async (req, res) => {
            try {
                const { playerName, playerSteamId, reason } = req.body;
                
                if (!playerName && !playerSteamId) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Player name or Steam ID required' 
                    });
                }

                const target = playerSteamId || playerName;
                const slayCommand = `Slay ${target}`;
                
                console.log(`🎯 Executing slay command: ${slayCommand}`);
                console.log(`📋 Reason: ${reason || 'No reason provided'}`);
                
                const result = await this.executeRCONCommand(slayCommand, 0x02);
                
                res.json({
                    success: true,
                    message: `Slay command sent for ${target}`,
                    command: slayCommand,
                    reason: reason,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Slay command failed:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // Get player list
        this.app.get('/rcon/players', async (req, res) => {
            try {
                const result = await this.executeRCONCommand('GetPlayerList', 0x40);
                res.json({
                    success: true,
                    players: result.message,
                    result: result
                });
            } catch (error) {
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // Execute custom RCON command
        this.app.post('/rcon/command', async (req, res) => {
            try {
                const { command, opcode } = req.body;
                
                if (!command) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Command required' 
                    });
                }

                console.log(`🎮 Executing custom command: ${command}`);
                
                const result = await this.executeRCONCommand(command, opcode || 0x02);
                
                res.json({
                    success: true,
                    message: `Command executed: ${command}`,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Custom command failed:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });
    }

    start(port = 3001) {
        this.app.listen(port, () => {
            console.log(`🚀 Isle RCON Bridge running on port ${port}`);
            console.log(`🎯 Ready to handle slay commands for Isle server`);
            console.log(`🔗 Endpoints available:`);
            console.log(`   GET  /health - Health check`);
            console.log(`   GET  /rcon/test - Test RCON connection`);
            console.log(`   GET  /rcon/players - Get player list`);
            console.log(`   POST /rcon/slay - Slay a player`);
            console.log(`   POST /rcon/command - Execute custom command`);
        });
    }
}

// Start the bridge if this file is run directly
if (require.main === module) {
    const bridge = new IsleRCONBridge();
    bridge.start();
}

module.exports = IsleRCONBridge;