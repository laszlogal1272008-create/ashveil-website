// VPS RCON Bridge Monitor - Enhanced version for 24/7 testing
const express = require('express');
const net = require('net');
const cors = require('cors');
const fs = require('fs').promises;

class Enhanced24x7RCONBridge {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        
        this.rconConfig = {
            host: '45.45.238.134',
            port: 16007,
            password: 'CookieMonster420'
        };

        this.commandHistory = [];
        this.successfulCommands = new Set();
        this.playerStatusHistory = [];
        this.isMonitoring = false;
        
        // Start continuous monitoring
        this.startContinuousMonitoring();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            if (req.body && Object.keys(req.body).length > 0) {
                console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
            }
            next();
        });
    }

    async executeRCONCommand(command, opcode = 0x02) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            let authenticated = false;
            let response = '';
            const startTime = Date.now();
            
            const timeout = setTimeout(() => {
                client.destroy();
                resolve({ 
                    success: true, 
                    message: 'Command sent successfully (no response expected)',
                    command: command,
                    duration: Date.now() - startTime
                });
            }, 8000);

            client.connect(this.rconConfig.port, this.rconConfig.host, () => {
                console.log('🔌 RCON Connected, authenticating...');
                
                const authPacket = Buffer.concat([
                    Buffer.from([0x01]),
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
                    
                    const commandPacket = Buffer.concat([
                        Buffer.from([opcode]),
                        Buffer.from(command, 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                    
                } else if (authenticated) {
                    response += dataStr;
                    
                    // Check for immediate success indicators
                    if (this.isSuccessResponse(dataStr)) {
                        clearTimeout(timeout);
                        client.destroy();
                        
                        this.successfulCommands.add(command);
                        this.logCommandSuccess(command, dataStr);
                        
                        resolve({ 
                            success: true, 
                            message: `SUCCESS! ${dataStr}`,
                            command: command,
                            response: dataStr,
                            duration: Date.now() - startTime
                        });
                    }
                }
            });

            client.on('error', (err) => {
                clearTimeout(timeout);
                console.error('❌ RCON Error:', err.message);
                reject({ success: false, error: err.message });
            });
        });
    }

    isSuccessResponse(response) {
        const successIndicators = [
            'execute result : True',
            'killed',
            'slain', 
            'died',
            'dead',
            'eliminated',
            'health: 0',
            'Health: 0.00'
        ];
        
        return successIndicators.some(indicator => 
            response.toLowerCase().includes(indicator.toLowerCase())
        );
    }

    async logCommandSuccess(command, response) {
        const successLog = {
            command: command,
            response: response,
            timestamp: new Date().toISOString(),
            type: 'SUCCESS'
        };
        
        this.commandHistory.push(successLog);
        
        // Save to file
        try {
            await fs.appendFile('successful-commands.log', 
                JSON.stringify(successLog) + '\n'
            );
        } catch (error) {
            console.error('Error logging success:', error);
        }
        
        console.log('🎉 SUCCESSFUL COMMAND LOGGED!', successLog);
    }

    async startContinuousMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('👁️ Starting continuous player monitoring...');
        
        setInterval(async () => {
            try {
                const playerStatus = await this.checkPlayerStatus();
                if (playerStatus) {
                    this.playerStatusHistory.push({
                        status: playerStatus,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Check if player died
                    if (playerStatus.includes('Health: 0') || playerStatus.includes('dead')) {
                        console.log('🎉 PLAYER DEATH DETECTED!');
                        await this.identifyKillCommand();
                    }
                    
                    // Keep only last 100 status checks
                    if (this.playerStatusHistory.length > 100) {
                        this.playerStatusHistory = this.playerStatusHistory.slice(-100);
                    }
                }
            } catch (error) {
                console.error('❌ Error in monitoring:', error);
            }
        }, 15000); // Check every 15 seconds
    }

    async checkPlayerStatus() {
        return new Promise((resolve) => {
            const client = new net.Socket();
            
            const timeout = setTimeout(() => {
                client.destroy();
                resolve(null);
            }, 5000);

            client.connect(this.rconConfig.port, this.rconConfig.host, () => {
                const authPacket = Buffer.concat([
                    Buffer.from([0x01]),
                    Buffer.from(this.rconConfig.password, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(authPacket);
            });

            client.on('data', (data) => {
                const dataStr = data.toString('ascii');
                
                if (dataStr.includes('Password Accepted')) {
                    const commandPacket = Buffer.concat([
                        Buffer.from([0x02]),
                        Buffer.from('weather Misplacedcursor', 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                } else if (dataStr.includes('PlayerDataName')) {
                    clearTimeout(timeout);
                    client.destroy();
                    resolve(dataStr);
                }
            });

            client.on('error', () => {
                clearTimeout(timeout);
                resolve(null);
            });
        });
    }

    async identifyKillCommand() {
        console.log('🔍 Analyzing recent commands to identify successful kill...');
        
        const recentCommands = this.commandHistory.slice(-10);
        const analysis = {
            timestamp: new Date().toISOString(),
            recentCommands: recentCommands,
            likelySuccessfulCommand: recentCommands[recentCommands.length - 1]
        };
        
        // Save analysis
        try {
            await fs.appendFile('kill-analysis.log', 
                JSON.stringify(analysis, null, 2) + '\n'
            );
        } catch (error) {
            console.error('Error saving analysis:', error);
        }
        
        console.log('📊 Kill analysis saved!', analysis);
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                successfulCommands: this.successfulCommands.size,
                monitoring: this.isMonitoring
            });
        });

        // Enhanced slay endpoint with comprehensive testing
        this.app.post('/rcon/slay', async (req, res) => {
            try {
                const { playerName, playerSteamId, reason } = req.body;
                
                if (!playerName && !playerSteamId) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Player name or Steam ID required' 
                    });
                }

                console.log(`🎯 Enhanced slay request for: ${playerName || playerSteamId}`);
                
                // Try multiple command formats in order of likelihood
                const slayCommands = [
                    '/slay Misplacedcursor',           // CORRECT FORMAT! 
                    '/kill Misplacedcursor',           // Alternative with slash
                    'pslay Misplacedcursor',           // Known to get response
                    'pkill Misplacedcursor',           // Known to get response
                    '/slay 76561199520399511',         // Steam ID with slash
                    '/kill 76561199520399511',         // Steam ID kill with slash
                    'pslay 76561199520399511',         // Steam ID slay
                    'pkill 76561199520399511',         // Steam ID version
                    'slay Misplacedcursor',            // Standard slay (no slash)
                    'kill Misplacedcursor',            // Standard kill (no slash)
                    '/admin_slay Misplacedcursor'      // Admin variant with slash
                ];
                
                const results = [];
                let foundSuccess = false;
                
                for (const command of slayCommands) {
                    if (foundSuccess) break;
                    
                    try {
                        console.log(`🧪 Trying: ${command}`);
                        const result = await this.executeRCONCommand(command, 0x02);
                        results.push({
                            command: command,
                            result: result
                        });
                        
                        // Log all commands for analysis
                        this.commandHistory.push({
                            command: command,
                            result: result,
                            timestamp: new Date().toISOString(),
                            playerName: playerName,
                            reason: reason
                        });
                        
                        if (result.success && this.isSuccessResponse(result.response || '')) {
                            foundSuccess = true;
                            break;
                        }
                        
                        // Small delay between attempts
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                    } catch (error) {
                        console.log(`❌ ${command} failed:`, error.message);
                        results.push({
                            command: command,
                            error: error.message
                        });
                    }
                }
                
                res.json({
                    success: true,
                    message: foundSuccess ? 
                        'Found successful command! Player should be dead.' : 
                        'All commands attempted. Monitoring for results...',
                    commandsAttempted: slayCommands.length,
                    results: results,
                    successFound: foundSuccess,
                    monitoring: 'Continuous monitoring active to detect player death'
                });
                
            } catch (error) {
                console.error('❌ Enhanced slay error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // Get successful commands
        this.app.get('/rcon/successful', (req, res) => {
            res.json({
                successfulCommands: Array.from(this.successfulCommands),
                commandHistory: this.commandHistory.slice(-50),
                playerStatusHistory: this.playerStatusHistory.slice(-10)
            });
        });

        // Test custom command
        this.app.post('/rcon/command', async (req, res) => {
            try {
                const { command, opcode } = req.body;
                
                if (!command) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Command required' 
                    });
                }

                console.log(`🎮 Testing custom command: ${command}`);
                
                const result = await this.executeRCONCommand(command, opcode || 0x02);
                
                // Log command for analysis
                this.commandHistory.push({
                    command: command,
                    result: result,
                    timestamp: new Date().toISOString(),
                    type: 'custom'
                });
                
                res.json({
                    success: true,
                    message: `Command executed: ${command}`,
                    result: result
                });
                
            } catch (error) {
                console.error('❌ Custom command error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message || error 
                });
            }
        });

        // Get player status
        this.app.get('/rcon/status', async (req, res) => {
            try {
                const status = await this.checkPlayerStatus();
                res.json({
                    success: true,
                    playerStatus: status,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
    }

    start(port = 3001) {
        this.app.listen(port, () => {
            console.log(`🚀 Enhanced 24/7 RCON Bridge running on port ${port}`);
            console.log(`🎯 Comprehensive testing and monitoring active`);
            console.log(`👁️ Continuous player monitoring enabled`);
            console.log(`📊 Command analysis and logging active`);
            console.log(`🔗 Enhanced endpoints available:`);
            console.log(`   GET  /health - Health check with stats`);
            console.log(`   GET  /rcon/status - Get current player status`);
            console.log(`   GET  /rcon/successful - Get successful commands`);
            console.log(`   POST /rcon/slay - Enhanced multi-command slay`);
            console.log(`   POST /rcon/command - Test custom commands`);
        });
    }
}

const bridge = new Enhanced24x7RCONBridge();
bridge.start();