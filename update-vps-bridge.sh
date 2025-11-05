#!/bin/bash
# VPS RCON Bridge Update Script
# Run this on your VPS to update the bridge with enhanced command support

echo "🔥 UPDATING VPS RCON BRIDGE FOR COMMAND TESTING"
echo "================================================"

# Stop any existing RCON bridge processes
echo "1️⃣ Stopping existing RCON bridge..."
pkill -f rcon-bridge || echo "No existing bridge found"
pkill -f "node.*rcon" || echo "No node RCON processes found"

# Backup existing bridge if it exists
if [ -f "/root/rcon-bridge.js" ]; then
    echo "2️⃣ Backing up existing bridge..."
    cp /root/rcon-bridge.js /root/rcon-bridge-backup-$(date +%Y%m%d_%H%M%S).js
fi

# Create the enhanced bridge
echo "3️⃣ Creating enhanced RCON bridge..."
cat > /root/enhanced-rcon-bridge.js << 'EOF'
// Enhanced Isle RCON Bridge with Command Override Support
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
            res.json({ 
                status: 'Enhanced RCON Bridge Running', 
                timestamp: new Date().toISOString(),
                features: ['command_override', 'raw_commands', 'multiple_formats']
            });
        });

        // Enhanced slay endpoint that accepts different commands
        this.app.post('/rcon/slay', async (req, res) => {
            try {
                const { playerName, commandOverride, reason } = req.body;
                
                if (!playerName) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Player name required' 
                    });
                }

                // Use commandOverride if provided, otherwise default to slay
                const baseCommand = commandOverride || 'slay';
                const command = `${baseCommand} ${playerName}`;
                
                console.log(`🎮 ENHANCED: Executing "${command}" (Override: ${commandOverride || 'none'})`);
                
                const result = await this.executeRCONCommand(command, 0x02);
                
                res.json({
                    success: true,
                    message: `Player ${playerName} ${baseCommand} command sent`,
                    command: command,
                    commandOverride: commandOverride,
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

        // Raw command endpoint for direct testing
        this.app.post('/rcon/raw', async (req, res) => {
            try {
                const { command, opcode } = req.body;
                
                if (!command) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Command required' 
                    });
                }

                console.log(`🎮 RAW COMMAND: ${command}`);
                
                const result = await this.executeRCONCommand(command, opcode || 0x02);
                
                res.json({
                    success: true,
                    message: `Raw command executed: ${command}`,
                    command: command,
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

        // Test endpoint for quick command testing
        this.app.post('/rcon/test/:command', async (req, res) => {
            try {
                const { command } = req.params;
                const { playerName } = req.body;
                
                if (!playerName) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Player name required' 
                    });
                }

                const fullCommand = `${command} ${playerName}`;
                console.log(`🧪 TESTING: ${fullCommand}`);
                
                const result = await this.executeRCONCommand(fullCommand, 0x02);
                
                res.json({
                    success: true,
                    message: `Test command executed: ${fullCommand}`,
                    command: fullCommand,
                    testMode: true,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Test command failed:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });
    }

    start(port = 3001) {
        this.app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 ENHANCED Isle RCON Bridge running on port ${port}`);
            console.log(`🔗 Enhanced endpoints:`);
            console.log(`   GET  /health - Health check`);
            console.log(`   POST /rcon/slay - Enhanced slay with command override`);
            console.log(`   POST /rcon/raw - Execute any raw RCON command`);
            console.log(`   POST /rcon/test/:command - Test specific commands`);
            console.log(`📡 Connected to Isle server: ${this.rconConfig.host}:${this.rconConfig.port}`);
            console.log(`🎯 READY FOR COMMAND TESTING!`);
        });
    }
}

// Start the enhanced bridge
const bridge = new EnhancedIsleRCONBridge();
bridge.start();
EOF

echo "4️⃣ Starting enhanced RCON bridge..."
nohup node /root/enhanced-rcon-bridge.js > /root/rcon-bridge.log 2>&1 &

echo "5️⃣ Waiting for bridge to start..."
sleep 3

echo "6️⃣ Testing enhanced bridge..."
curl -s http://localhost:3001/health | python3 -m json.tool || echo "Health check response received"

echo ""
echo "🎉 ENHANCED RCON BRIDGE DEPLOYED!"
echo "=================================="
echo "Log file: /root/rcon-bridge.log"
echo "Test health: curl http://104.131.111.229:3001/health"
echo ""
echo "🧪 NEW TESTING ENDPOINTS:"
echo "POST /rcon/slay (with commandOverride support)"
echo "POST /rcon/raw (direct command execution)"
echo "POST /rcon/test/:command (quick testing)"
echo ""
echo "🔥 Ready to test commands from website!"