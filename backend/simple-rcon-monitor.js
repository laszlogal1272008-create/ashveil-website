#!/usr/bin/env node

/**
 * 🎯 Simple RCON Monitor (No Express)
 * Focuses purely on RCON connection monitoring
 */

const net = require('net');
const EventEmitter = require('events');

class SimpleRCONMonitor extends EventEmitter {
    constructor() {
        super();
        this.host = '45.45.238.134';
        this.port = 16007;
        this.password = 'CookieMonster420';
        this.isMonitoring = false;
        this.monitorInterval = 15000; // 15 seconds
        this.lastCheck = null;
        this.consecutiveFailures = 0;
        this.isConnected = false;
    }
    
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('🎯 Starting Simple RCON Monitor');
        console.log(`📡 Target: ${this.host}:${this.port}`);
        console.log(`🔄 Check interval: ${this.monitorInterval/1000}s`);
        console.log('=====================================');
        
        this.checkLoop();
    }
    
    async checkLoop() {
        while (this.isMonitoring) {
            await this.performCheck();
            await this.sleep(this.monitorInterval);
        }
    }
    
    async performCheck() {
        const timestamp = new Date().toISOString();
        console.log(`\n🔍 [${timestamp}] Checking RCON availability...`);
        
        try {
            const result = await this.testRCONConnection();
            this.lastCheck = { timestamp, result };
            
            if (result.success) {
                this.consecutiveFailures = 0;
                
                if (!this.isConnected) {
                    this.isConnected = true;
                    console.log('🎉 RCON IS NOW AVAILABLE!');
                    console.log(`   Server responded to authentication`);
                    console.log(`   Response: ${result.response || 'OK'}`);
                    this.emit('rcon-available');
                } else {
                    console.log('✅ RCON still available');
                }
                
            } else {
                this.consecutiveFailures++;
                
                if (this.isConnected) {
                    this.isConnected = false;
                    console.log('❌ RCON NO LONGER AVAILABLE');
                    this.emit('rcon-unavailable');
                } else {
                    console.log(`❌ RCON unavailable (${this.consecutiveFailures} consecutive failures)`);
                    console.log(`   Reason: ${result.error}`);
                }
            }
            
        } catch (error) {
            console.log('⚠️  Check failed:', error.message);
            this.consecutiveFailures++;
        }
    }
    
    async testRCONConnection() {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(5000);
            
            let authSent = false;
            let responseReceived = false;
            
            const cleanup = () => {
                socket.removeAllListeners();
                socket.destroy();
            };
            
            socket.on('connect', () => {
                console.log('  ✅ TCP connection established');
                
                // Send auth packet
                const authPacket = this.createAuthPacket();
                socket.write(authPacket);
                authSent = true;
                console.log('  🔐 Authentication packet sent');
            });
            
            socket.on('data', (data) => {
                responseReceived = true;
                console.log(`  📦 Server responded (${data.length} bytes)`);
                
                // Try to parse the response
                try {
                    if (data.length >= 12) { // Minimum RCON packet size
                        const size = data.readInt32LE(0);
                        const id = data.readInt32LE(4);
                        const type = data.readInt32LE(8);
                        
                        console.log(`      Size: ${size}, ID: ${id}, Type: ${type}`);
                        
                        if (type === 2) { // SERVERDATA_AUTH_RESPONSE
                            const success = id !== -1;
                            cleanup();
                            resolve({ 
                                success, 
                                response: success ? 'Authentication successful' : 'Authentication failed',
                                details: { size, id, type }
                            });
                            return;
                        }
                    }
                    
                    // Any response means server is alive
                    cleanup();
                    resolve({ 
                        success: true, 
                        response: 'Server responded (non-standard format)',
                        rawData: data.toString('hex')
                    });
                    
                } catch (parseError) {
                    cleanup();
                    resolve({ 
                        success: true,
                        response: 'Server responded but could not parse',
                        rawData: data.toString('hex')
                    });
                }
            });
            
            socket.on('timeout', () => {
                console.log('  ⏰ Connection timeout');
                cleanup();
                resolve({ 
                    success: false, 
                    error: authSent ? 'No response to auth packet' : 'Connection timeout' 
                });
            });
            
            socket.on('error', (err) => {
                console.log(`  ❌ Connection error: ${err.message}`);
                cleanup();
                resolve({ success: false, error: err.message });
            });
            
            socket.on('close', () => {
                if (!responseReceived && authSent) {
                    console.log('  🔌 Connection closed without response');
                    resolve({ success: false, error: 'Connection closed without response' });
                }
            });
            
            // Start connection
            socket.connect(this.port, this.host);
        });
    }
    
    createAuthPacket() {
        const password = this.password;
        const bodyBuffer = Buffer.from(password + '\x00\x00', 'ascii');
        const size = bodyBuffer.length + 8; // ID (4) + Type (4) + Body
        
        const packet = Buffer.allocUnsafe(4 + size);
        let offset = 0;
        
        // Write size
        packet.writeInt32LE(size, offset);
        offset += 4;
        
        // Write ID (use 1 for auth)
        packet.writeInt32LE(1, offset);
        offset += 4;
        
        // Write type (3 = SERVERDATA_AUTH)
        packet.writeInt32LE(3, offset);
        offset += 4;
        
        // Write body
        bodyBuffer.copy(packet, offset);
        
        return packet;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    stop() {
        this.isMonitoring = false;
        console.log('\n🛑 Monitor stopped');
    }
    
    getStatus() {
        return {
            monitoring: this.isMonitoring,
            connected: this.isConnected,
            consecutiveFailures: this.consecutiveFailures,
            lastCheck: this.lastCheck
        };
    }
}

// Create and start monitor
const monitor = new SimpleRCONMonitor();

monitor.on('rcon-available', () => {
    console.log('\n🚨 ALERT: RCON SERVER IS NOW RESPONDING!');
    console.log('   This means Austin or the server admin enabled RCON');
    console.log('   Your VPS bridge can now connect and handle slay commands');
});

monitor.on('rcon-unavailable', () => {
    console.log('\n⚠️  ALERT: RCON SERVER STOPPED RESPONDING');
    console.log('   The server may have been restarted or RCON disabled');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down monitor...');
    monitor.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    monitor.stop();
});

// Start monitoring
monitor.startMonitoring();

console.log('\n💡 This monitor will run continuously and alert you when RCON becomes available');
console.log('Press Ctrl+C to stop monitoring');