// Quick VPS Bridge Patch to Accept Different Commands
// This should be uploaded to replace the current bridge

const express = require('express');
const net = require('net');
const cors = require('cors');

class EnhancedIsleRCONBridge {
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
                if (!authenticated) {
                    console.log('🔓 RCON Authenticated, sending command:', command);
                    authenticated = true;
                    
                    // Send the actual command
                    const commandPacket = Buffer.concat([
                        Buffer.from([opcode]),
                        Buffer.from(command, 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                } else {
                    response += data.toString();
                    console.log('📨 RCON Response:', response);
                }
            });

            client.on('close', () => {
                clearTimeout(timeout);
                console.log('🔌 RCON Connection closed');
                resolve({ 
                    success: true, 
                    message: `Command executed: ${command}`,
                    response: response || 'Command sent successfully'
                });
            });

            client.on('error', (error) => {
                clearTimeout(timeout);
                console.error('❌ RCON Error:', error);
                reject(error);
            });
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'Enhanced RCON Bridge Running', timestamp: new Date().toISOString() });
        });

        // Working RCON commands with correct opcodes
        this.app.post('/rcon/announce', async (req, res) => {
            try {
                const { message } = req.body;
                
                if (!message) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Message required' 
                    });
                }

                console.log(`📢 Announcing: ${message}`);
                
                const result = await this.executeRCONCommand(message, 0x10);
                
                res.json({
                    success: true,
                    message: `Announcement sent: ${message}`,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Announce failed:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // Kick player endpoint
        this.app.post('/rcon/kick', async (req, res) => {
            try {
                const { playerName, reason } = req.body;
                
                if (!playerName) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Player name required' 
                    });
                }

                const command = `"${playerName}",${reason || 'Kicked by admin'}`;
                console.log(`👢 Kicking: ${command}`);
                
                const result = await this.executeRCONCommand(command, 0x30);
                
                res.json({
                    success: true,
                    message: `Player ${playerName} kicked`,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Kick failed:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // New raw command endpoint
        this.app.post('/rcon/raw', async (req, res) => {
            try {
                const { command, opcode } = req.body;
                
                if (!command) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Command required' 
                    });
                }

                console.log(`🎮 Raw command: ${command}`);
                
                const result = await this.executeRCONCommand(command, opcode || 0x02);
                
                res.json({
                    success: true,
                    message: `Raw command executed: ${command}`,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Raw command failed:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });
    }

    start(port = 3001) {
        this.app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Enhanced Isle RCON Bridge running on port ${port}`);
            console.log(`🔗 Endpoints available:`);
            console.log(`   GET  /health - Health check`);
            console.log(`   POST /rcon/announce - Send server announcements`);
            console.log(`   POST /rcon/kick - Kick players from server`);
            console.log(`   POST /rcon/raw - Execute any raw RCON command`);
            console.log(`📡 Connected to Isle server: ${this.rconConfig.host}:${this.rconConfig.port}`);
        });
    }
}

// Start the enhanced bridge
const bridge = new EnhancedIsleRCONBridge();
bridge.start();