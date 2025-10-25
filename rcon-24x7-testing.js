// 24/7 Comprehensive RCON Testing System
const net = require('net');
const fs = require('fs').promises;
const path = require('path');

class RCONTestingSuite {
    constructor() {
        this.rconConfig = {
            host: '45.45.238.134',
            port: 16007,
            password: 'CookieMonster420'
        };
        
        this.testResults = [];
        this.isRunning = false;
        this.testCycle = 0;
        this.successfulCommands = new Set();
        this.failedCommands = new Set();
        this.logFile = path.join(__dirname, 'rcon-test-log.json');
        
        // Comprehensive command list for testing
        this.commandsToTest = [
            // Basic formats we know work
            { cmd: 'pkill Misplacedcursor', category: 'kill', priority: 'high' },
            { cmd: 'pslay Misplacedcursor', category: 'slay', priority: 'high' },
            { cmd: 'weather Misplacedcursor', category: 'info', priority: 'high' },
            
            // Steam ID variations
            { cmd: 'pkill 76561199520399511', category: 'kill', priority: 'high' },
            { cmd: 'pslay 76561199520399511', category: 'slay', priority: 'high' },
            
            // Standard kill/slay variations
            { cmd: 'kill Misplacedcursor', category: 'kill', priority: 'medium' },
            { cmd: 'slay Misplacedcursor', category: 'slay', priority: 'medium' },
            { cmd: 'Kill Misplacedcursor', category: 'kill', priority: 'medium' },
            { cmd: 'Slay Misplacedcursor', category: 'slay', priority: 'medium' },
            { cmd: 'KILL Misplacedcursor', category: 'kill', priority: 'medium' },
            { cmd: 'SLAY Misplacedcursor', category: 'slay', priority: 'medium' },
            
            // Admin variations
            { cmd: 'admin_kill Misplacedcursor', category: 'admin-kill', priority: 'medium' },
            { cmd: 'admin_slay Misplacedcursor', category: 'admin-slay', priority: 'medium' },
            { cmd: 'AdminKill Misplacedcursor', category: 'admin-kill', priority: 'medium' },
            { cmd: 'AdminSlay Misplacedcursor', category: 'admin-slay', priority: 'medium' },
            
            // Force/instant variations
            { cmd: 'force_kill Misplacedcursor', category: 'force-kill', priority: 'medium' },
            { cmd: 'instant_kill Misplacedcursor', category: 'instant-kill', priority: 'medium' },
            { cmd: 'execute Misplacedcursor', category: 'execute', priority: 'medium' },
            { cmd: 'terminate Misplacedcursor', category: 'terminate', priority: 'medium' },
            
            // Damage-based approaches
            { cmd: 'damage Misplacedcursor 1000', category: 'damage', priority: 'high' },
            { cmd: 'pdamage Misplacedcursor 1000', category: 'damage', priority: 'high' },
            { cmd: 'hurt Misplacedcursor 1000', category: 'damage', priority: 'medium' },
            { cmd: 'harm Misplacedcursor 1000', category: 'damage', priority: 'medium' },
            
            // Health manipulation
            { cmd: 'sethealth Misplacedcursor 0', category: 'health', priority: 'high' },
            { cmd: 'phealth Misplacedcursor 0', category: 'health', priority: 'high' },
            { cmd: 'health Misplacedcursor 0', category: 'health', priority: 'medium' },
            { cmd: 'setplayerhealth Misplacedcursor 0', category: 'health', priority: 'medium' },
            
            // Alternative approaches
            { cmd: 'kick Misplacedcursor', category: 'kick', priority: 'low' },
            { cmd: 'ban Misplacedcursor', category: 'ban', priority: 'low' },
            { cmd: 'remove Misplacedcursor', category: 'remove', priority: 'medium' },
            { cmd: 'delete Misplacedcursor', category: 'delete', priority: 'medium' },
            
            // Teleport to dangerous location
            { cmd: 'teleport Misplacedcursor 0 0 -1000', category: 'teleport', priority: 'medium' },
            { cmd: 'tp Misplacedcursor 0 0 -1000', category: 'teleport', priority: 'medium' },
            
            // Starvation approach
            { cmd: 'sethunger Misplacedcursor 0', category: 'hunger', priority: 'medium' },
            { cmd: 'setthirst Misplacedcursor 0', category: 'thirst', priority: 'medium' },
            
            // Console commands
            { cmd: 'suicide', category: 'suicide', priority: 'high' },
            { cmd: 'respawn', category: 'respawn', priority: 'medium' },
            { cmd: 'restart', category: 'restart', priority: 'low' },
            
            // Player state commands
            { cmd: 'freeze Misplacedcursor', category: 'freeze', priority: 'low' },
            { cmd: 'stun Misplacedcursor', category: 'stun', priority: 'low' },
            { cmd: 'paralyze Misplacedcursor', category: 'paralyze', priority: 'low' }
        ];
    }

    async start24x7Testing() {
        console.log('🚀 Starting 24/7 Comprehensive RCON Testing System');
        console.log(`📊 Testing ${this.commandsToTest.length} different command variations`);
        
        this.isRunning = true;
        this.startTime = new Date();
        
        // Load previous results if they exist
        await this.loadPreviousResults();
        
        // Start the main testing loop
        this.runTestingLoop();
        
        // Start the monitoring loop
        this.runMonitoringLoop();
        
        // Start background research
        this.runBackgroundResearch();
        
        console.log('✅ 24/7 Testing system is now running!');
        console.log('📝 Results will be logged to rcon-test-log.json');
        console.log('🔍 Press Ctrl+C to stop');
    }

    async runTestingLoop() {
        while (this.isRunning) {
            try {
                this.testCycle++;
                console.log(`\n🔄 Test Cycle #${this.testCycle} - ${new Date().toISOString()}`);
                
                // Test high priority commands more frequently
                const commandsToTestNow = this.commandsToTest.filter(cmd => {
                    if (cmd.priority === 'high') return true;
                    if (cmd.priority === 'medium' && this.testCycle % 3 === 0) return true;
                    if (cmd.priority === 'low' && this.testCycle % 10 === 0) return true;
                    return false;
                });
                
                console.log(`🧪 Testing ${commandsToTestNow.length} commands this cycle`);
                
                for (const commandTest of commandsToTestNow) {
                    if (!this.isRunning) break;
                    
                    try {
                        const result = await this.testSingleCommand(commandTest);
                        await this.logResult(result);
                        
                        if (result.success) {
                            this.successfulCommands.add(commandTest.cmd);
                            console.log(`✅ ${commandTest.cmd} - SUCCESS!`);
                        } else {
                            this.failedCommands.add(commandTest.cmd);
                        }
                        
                        // Wait between commands to avoid overwhelming server
                        await this.sleep(2000);
                        
                    } catch (error) {
                        console.log(`❌ Error testing ${commandTest.cmd}:`, error.message);
                    }
                }
                
                // Save results after each cycle
                await this.saveResults();
                
                // Wait before next cycle (5 minutes for full cycle)
                console.log('⏰ Waiting 5 minutes before next test cycle...');
                await this.sleep(300000); // 5 minutes
                
            } catch (error) {
                console.error('❌ Error in testing loop:', error);
                await this.sleep(60000); // Wait 1 minute on error
            }
        }
    }

    async testSingleCommand(commandTest) {
        return new Promise((resolve) => {
            const client = new net.Socket();
            const startTime = Date.now();
            let authenticated = false;
            let response = '';
            
            const timeout = setTimeout(() => {
                client.destroy();
                resolve({
                    command: commandTest.cmd,
                    category: commandTest.category,
                    success: false,
                    response: 'Timeout',
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - startTime
                });
            }, 10000);

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
                
                if (!authenticated && dataStr.includes('Password Accepted')) {
                    authenticated = true;
                    
                    const commandPacket = Buffer.concat([
                        Buffer.from([0x02]),
                        Buffer.from(commandTest.cmd, 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                    
                } else if (authenticated) {
                    response += dataStr;
                    
                    // Check for success indicators
                    const isSuccess = this.checkForSuccess(dataStr, commandTest);
                    
                    clearTimeout(timeout);
                    client.destroy();
                    
                    resolve({
                        command: commandTest.cmd,
                        category: commandTest.category,
                        success: isSuccess,
                        response: response || dataStr,
                        timestamp: new Date().toISOString(),
                        duration: Date.now() - startTime
                    });
                }
            });

            client.on('error', (err) => {
                clearTimeout(timeout);
                resolve({
                    command: commandTest.cmd,
                    category: commandTest.category,
                    success: false,
                    response: `Error: ${err.message}`,
                    timestamp: new Date().toISOString(),
                    duration: Date.now() - startTime
                });
            });
        });
    }

    checkForSuccess(response, commandTest) {
        // Check for various success indicators
        const successIndicators = [
            'execute result : True',
            'successfully',
            'killed',
            'slain',
            'dead',
            'eliminated',
            'terminated',
            'damaged',
            'health set to 0',
            'Player died',
            'Death',
            'Respawn'
        ];
        
        const responseLC = response.toLowerCase();
        return successIndicators.some(indicator => 
            responseLC.includes(indicator.toLowerCase())
        );
    }

    async runMonitoringLoop() {
        while (this.isRunning) {
            try {
                // Monitor player status every 30 seconds
                const playerStatus = await this.checkPlayerStatus();
                
                if (playerStatus && playerStatus.includes('Health: 0')) {
                    console.log('🎉 PLAYER DIED! A command worked!');
                    // Log which recent commands might have caused this
                    await this.identifySuccessfulCommand();
                }
                
                await this.sleep(30000); // Check every 30 seconds
                
            } catch (error) {
                console.error('❌ Error in monitoring loop:', error);
                await this.sleep(60000);
            }
        }
    }

    async checkPlayerStatus() {
        return new Promise((resolve) => {
            const client = new net.Socket();
            
            client.connect(this.rconConfig.port, this.rconConfig.host, () => {
                const authPacket = Buffer.concat([
                    Buffer.from([0x01]),
                    Buffer.from(this.rconConfig.password, 'utf8'),
                    Buffer.from([0x00])
                ]);
                client.write(authPacket);
            });

            client.on('data', (data) => {
                const response = data.toString('ascii');
                
                if (response.includes('Password Accepted')) {
                    const commandPacket = Buffer.concat([
                        Buffer.from([0x02]),
                        Buffer.from('weather Misplacedcursor', 'utf8'),
                        Buffer.from([0x00])
                    ]);
                    client.write(commandPacket);
                } else {
                    client.destroy();
                    resolve(response);
                }
            });

            setTimeout(() => {
                client.destroy();
                resolve(null);
            }, 5000);
        });
    }

    async runBackgroundResearch() {
        console.log('🔍 Starting background research for RCON solutions...');
        
        while (this.isRunning) {
            try {
                // Research different approaches every hour
                await this.researchNewCommands();
                await this.analyzeSuccessPatterns();
                await this.generateNewCommandVariations();
                
                await this.sleep(3600000); // 1 hour
                
            } catch (error) {
                console.error('❌ Error in background research:', error);
                await this.sleep(1800000); // 30 minutes on error
            }
        }
    }

    async researchNewCommands() {
        console.log('📚 Researching new command variations...');
        
        // Generate new commands based on successful patterns
        const newCommands = [];
        
        // If pkill works, try similar patterns
        if (this.successfulCommands.has('pkill Misplacedcursor')) {
            newCommands.push(
                { cmd: 'pkill_force Misplacedcursor', category: 'kill-force', priority: 'high' },
                { cmd: 'pkill_instant Misplacedcursor', category: 'kill-instant', priority: 'high' },
                { cmd: 'pkill_admin Misplacedcursor', category: 'kill-admin', priority: 'high' }
            );
        }
        
        // Add new commands to test list
        this.commandsToTest.push(...newCommands);
        
        console.log(`📝 Added ${newCommands.length} new commands to test`);
    }

    async analyzeSuccessPatterns() {
        console.log('📊 Analyzing success patterns...');
        
        // Analyze which command categories are most successful
        const successStats = {};
        this.successfulCommands.forEach(cmd => {
            const test = this.commandsToTest.find(t => t.cmd === cmd);
            if (test) {
                successStats[test.category] = (successStats[test.category] || 0) + 1;
            }
        });
        
        console.log('📈 Success statistics:', successStats);
    }

    async generateNewCommandVariations() {
        console.log('🧪 Generating new command variations...');
        
        // Generate variations of successful commands
        const baseCommands = Array.from(this.successfulCommands);
        const newVariations = [];
        
        baseCommands.forEach(cmd => {
            // Try different player identifiers
            newVariations.push(
                { cmd: cmd.replace('Misplacedcursor', '76561199520399511'), category: 'steamid-variation', priority: 'medium' },
                { cmd: cmd.replace('Misplacedcursor', '*'), category: 'wildcard', priority: 'medium' },
                { cmd: cmd + ' force', category: 'force-modifier', priority: 'medium' },
                { cmd: cmd + ' instant', category: 'instant-modifier', priority: 'medium' }
            );
        });
        
        this.commandsToTest.push(...newVariations);
        console.log(`🔬 Generated ${newVariations.length} new variations`);
    }

    async logResult(result) {
        this.testResults.push(result);
        
        // Keep only last 1000 results to prevent memory issues
        if (this.testResults.length > 1000) {
            this.testResults = this.testResults.slice(-1000);
        }
    }

    async saveResults() {
        const data = {
            startTime: this.startTime,
            testCycle: this.testCycle,
            successfulCommands: Array.from(this.successfulCommands),
            failedCommands: Array.from(this.failedCommands),
            recentResults: this.testResults.slice(-100), // Last 100 results
            stats: {
                totalCommandsTested: this.commandsToTest.length,
                successCount: this.successfulCommands.size,
                failureCount: this.failedCommands.size
            },
            lastUpdate: new Date().toISOString()
        };
        
        try {
            await fs.writeFile(this.logFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('❌ Error saving results:', error);
        }
    }

    async loadPreviousResults() {
        try {
            const data = await fs.readFile(this.logFile, 'utf8');
            const parsed = JSON.parse(data);
            
            this.successfulCommands = new Set(parsed.successfulCommands || []);
            this.failedCommands = new Set(parsed.failedCommands || []);
            this.testCycle = parsed.testCycle || 0;
            
            console.log(`📁 Loaded previous results: ${this.successfulCommands.size} successful, ${this.failedCommands.size} failed`);
            
        } catch (error) {
            console.log('📁 No previous results found, starting fresh');
        }
    }

    async identifySuccessfulCommand() {
        const recentCommands = this.testResults.slice(-10); // Last 10 commands
        console.log('🔍 Recent commands that may have caused death:');
        recentCommands.forEach(result => {
            console.log(`   - ${result.command} (${result.response})`);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        console.log('🛑 Stopping 24/7 testing system...');
        this.isRunning = false;
    }
}

// Start the 24/7 testing system
const testingSuite = new RCONTestingSuite();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received interrupt signal...');
    testingSuite.stop();
    await testingSuite.saveResults();
    console.log('💾 Results saved. Exiting...');
    process.exit(0);
});

// Start the system
testingSuite.start24x7Testing().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

module.exports = RCONTestingSuite;