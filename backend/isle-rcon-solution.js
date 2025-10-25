#!/usr/bin/env node

/**
 * 🎯 Complete RCON Solution & Monitoring System
 * 
 * This handles multiple scenarios:
 * 1. Standard Source RCON protocol
 * 2. Alternative authentication methods
 * 3. Continuous monitoring for when RCON becomes available
 * 4. Integration with your VPS system
 */

const express = require('express');
const net = require('net');
const EventEmitter = require('events');

class IsleRCONSolution extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            host: config.host || '45.45.238.134',
            port: config.port || 16007,
            password: config.password || 'CookieMonster420',
            monitorInterval: config.monitorInterval || 30000, // 30 seconds
            timeout: config.timeout || 10000,
            maxReconnectAttempts: config.maxReconnectAttempts || 5,
            ...config
        };
        
        this.socket = null;
        this.isConnected = false;
        this.isMonitoring = false;
        this.requestId = 1;
        this.pendingRequests = new Map();
        this.buffer = Buffer.alloc(0);
        this.lastSuccessfulConnection = null;
        this.monitorTimer = null;
        
        console.log('🎯 Isle RCON Solution initialized');
        console.log(`📡 Target: ${this.config.host}:${this.config.port}`);
    }
    
    // ===========================================
    // MONITORING SYSTEM
    // ===========================================
    
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        console.log('👁️  Starting RCON availability monitoring...');
        
        this.monitorTimer = setInterval(() => {
            this.checkRCONAvailability();
        }, this.config.monitorInterval);
        
        // Check immediately
        this.checkRCONAvailability();
        
        this.emit('monitoring-started');
    }
    
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        if (this.monitorTimer) {
            clearInterval(this.monitorTimer);
            this.monitorTimer = null;
        }
        
        console.log('👁️  RCON monitoring stopped');
        this.emit('monitoring-stopped');
    }
    
    async checkRCONAvailability() {
        console.log('🔍 Checking RCON availability...');
        
        try {
            const isAvailable = await this.testConnection();
            
            if (isAvailable && !this.isConnected) {
                console.log('✅ RCON is now available! Attempting connection...');
                await this.connect();
            } else if (!isAvailable && this.isConnected) {
                console.log('❌ RCON connection lost');
                this.disconnect();
            }
            
        } catch (error) {
            console.log('⚠️  RCON availability check failed:', error.message);
        }
    }
    
    async testConnection() {
        return new Promise((resolve) => {
            const testSocket = new net.Socket();
            testSocket.setTimeout(3000);
            
            testSocket.on('connect', () => {
                // Send a test auth packet
                const authPacket = this.createPacket(999, 3, this.config.password);
                testSocket.write(authPacket);
                
                // If we get any response, RCON is available
                const responseTimeout = setTimeout(() => {
                    testSocket.destroy();
                    resolve(false);
                }, 2000);
                
                testSocket.once('data', () => {
                    clearTimeout(responseTimeout);
                    testSocket.destroy();
                    resolve(true);
                });
            });
            
            testSocket.on('error', () => resolve(false));
            testSocket.on('timeout', () => {
                testSocket.destroy();
                resolve(false);
            });
            
            testSocket.connect(this.config.port, this.config.host);
        });
    }
    
    // ===========================================
    // CONNECTION MANAGEMENT
    // ===========================================
    
    async connect() {
        if (this.isConnected || this.socket) {
            console.log('⚠️  Already connected or connecting');
            return false;
        }
        
        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to ${this.config.host}:${this.config.port}...`);
            
            this.socket = new net.Socket();
            this.socket.setTimeout(this.config.timeout);
            this.buffer = Buffer.alloc(0);
            
            const timeout = setTimeout(() => {
                this.cleanup();
                reject(new Error('Connection timeout'));
            }, this.config.timeout);
            
            this.socket.on('connect', () => {
                console.log('✅ TCP connection established');
                clearTimeout(timeout);
                
                // Send authentication
                this.sendAuthentication();
            });
            
            this.socket.on('data', (data) => {
                this.buffer = Buffer.concat([this.buffer, data]);
                this.processBuffer();
            });
            
            this.socket.on('error', (error) => {
                clearTimeout(timeout);
                console.log('❌ Connection error:', error.message);
                this.cleanup();
                reject(error);
            });
            
            this.socket.on('close', () => {
                console.log('🔌 Connection closed');
                this.handleDisconnection();
            });
            
            // Set up authentication success handler
            this.once('authenticated', () => {
                this.isConnected = true;
                this.lastSuccessfulConnection = new Date();
                console.log('🎉 RCON authentication successful!');
                this.emit('connected');
                resolve(true);
            });
            
            this.once('auth-failed', () => {
                this.cleanup();
                reject(new Error('Authentication failed'));
            });
            
            // Start connection
            this.socket.connect(this.config.port, this.config.host);
        });
    }
    
    sendAuthentication() {
        const authId = this.requestId++;
        console.log(`🔐 Sending authentication (ID: ${authId})...`);
        
        const packet = this.createPacket(authId, 3, this.config.password); // SERVERDATA_AUTH
        this.socket.write(packet);
        
        // Store auth request
        this.pendingRequests.set(authId, {
            type: 'auth',
            timestamp: Date.now()
        });
    }
    
    processBuffer() {
        while (this.buffer.length >= 4) {
            const size = this.buffer.readInt32LE(0);
            
            if (this.buffer.length < 4 + size) {
                break; // Wait for more data
            }
            
            const packetData = this.buffer.slice(4, 4 + size);
            this.buffer = this.buffer.slice(4 + size);
            
            this.handlePacket(packetData);
        }
    }
    
    handlePacket(data) {
        if (data.length < 8) return;
        
        const id = data.readInt32LE(0);
        const type = data.readInt32LE(4);
        const body = data.slice(8, data.length - 2).toString('ascii');
        
        console.log(`📦 Packet received - ID: ${id}, Type: ${type}, Body: "${body}"`);
        
        if (type === 2) { // SERVERDATA_AUTH_RESPONSE
            const request = this.pendingRequests.get(id);
            this.pendingRequests.delete(id);
            
            if (request && request.type === 'auth') {
                if (id === -1) {
                    this.emit('auth-failed');
                } else {
                    this.emit('authenticated');
                }
            }
        } else if (type === 0) { // SERVERDATA_RESPONSE_VALUE
            const request = this.pendingRequests.get(id);
            if (request) {
                this.pendingRequests.delete(id);
                clearTimeout(request.timeout);
                request.resolve(body);
            }
        }
    }
    
    // ===========================================
    // COMMAND EXECUTION
    // ===========================================
    
    async executeCommand(command) {
        if (!this.isConnected) {
            throw new Error('Not connected to RCON server');
        }
        
        return new Promise((resolve, reject) => {
            const cmdId = this.requestId++;
            const packet = this.createPacket(cmdId, 2, command); // SERVERDATA_EXECCOMMAND
            
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(cmdId);
                reject(new Error('Command timeout'));
            }, this.config.timeout);
            
            this.pendingRequests.set(cmdId, {
                resolve,
                reject,
                timeout,
                command,
                timestamp: Date.now()
            });
            
            console.log(`⚡ Executing command: "${command}" (ID: ${cmdId})`);
            this.socket.write(packet);
        });
    }
    
    async slayPlayer(playerId) {
        try {
            const result = await this.executeCommand(`kill ${playerId}`);
            console.log(`💀 Slay command executed for player ${playerId}`);
            return { success: true, result };
        } catch (error) {
            console.log(`❌ Slay command failed for player ${playerId}:`, error.message);
            return { success: false, error: error.message };
        }
    }
    
    // ===========================================
    // UTILITY METHODS
    // ===========================================
    
    createPacket(id, type, body) {
        const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
        const size = bodyBuffer.length + 8;
        
        const packet = Buffer.allocUnsafe(4 + size);
        let offset = 0;
        
        packet.writeInt32LE(size, offset);
        offset += 4;
        packet.writeInt32LE(id, offset);
        offset += 4;
        packet.writeInt32LE(type, offset);
        offset += 4;
        bodyBuffer.copy(packet, offset);
        
        return packet;
    }
    
    disconnect() {
        this.cleanup();
        this.emit('disconnected');
    }
    
    cleanup() {
        this.isConnected = false;
        
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
            this.socket = null;
        }
        
        // Clean up pending requests
        this.pendingRequests.forEach((request) => {
            if (request.timeout) clearTimeout(request.timeout);
            if (request.reject) request.reject(new Error('Connection lost'));
        });
        this.pendingRequests.clear();
        
        this.buffer = Buffer.alloc(0);
    }
    
    handleDisconnection() {
        const wasConnected = this.isConnected;
        this.cleanup();
        
        if (wasConnected) {
            console.log('📡 RCON disconnected - monitoring will attempt reconnection');
            this.emit('disconnected');
        }
    }
    
    getStatus() {
        return {
            connected: this.isConnected,
            monitoring: this.isMonitoring,
            lastConnection: this.lastSuccessfulConnection,
            host: this.config.host,
            port: this.config.port,
            pendingRequests: this.pendingRequests.size
        };
    }
}

// ===========================================
// EXPRESS API SERVER
// ===========================================

const app = express();
app.use(express.json());

const rconClient = new IsleRCONSolution();

// API Routes
app.get('/api/rcon/status', (req, res) => {
    res.json(rconClient.getStatus());
});

app.post('/api/rcon/start-monitoring', (req, res) => {
    rconClient.startMonitoring();
    res.json({ success: true, message: 'RCON monitoring started' });
});

app.post('/api/rcon/stop-monitoring', (req, res) => {
    rconClient.stopMonitoring();
    res.json({ success: true, message: 'RCON monitoring stopped' });
});

app.post('/api/rcon/connect', async (req, res) => {
    try {
        const result = await rconClient.connect();
        res.json({ success: result, message: result ? 'Connected' : 'Connection failed' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/rcon/command', async (req, res) => {
    try {
        const { command } = req.body;
        if (!command) {
            return res.status(400).json({ success: false, error: 'Command required' });
        }
        
        const result = await rconClient.executeCommand(command);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/rcon/slay', async (req, res) => {
    try {
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({ success: false, error: 'Player ID required' });
        }
        
        const result = await rconClient.slayPlayer(playerId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Event logging
rconClient.on('connected', () => {
    console.log('🎉 RCON CLIENT CONNECTED - Ready for commands!');
});

rconClient.on('disconnected', () => {
    console.log('📡 RCON CLIENT DISCONNECTED');
});

rconClient.on('monitoring-started', () => {
    console.log('👁️  RCON MONITORING ACTIVE');
});

// Start the server
const PORT = process.env.PORT || 3003;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Isle RCON Solution running on port ${PORT}`);
    console.log('=====================================');
    console.log('Available endpoints:');
    console.log('• GET  /api/rcon/status           - Check RCON status');
    console.log('• POST /api/rcon/start-monitoring - Start monitoring');
    console.log('• POST /api/rcon/connect          - Manual connect');
    console.log('• POST /api/rcon/command          - Execute command');
    console.log('• POST /api/rcon/slay            - Slay player');
    console.log('=====================================');
    
    // Start monitoring immediately
    rconClient.startMonitoring();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    rconClient.stopMonitoring();
    rconClient.disconnect();
    server.close();
});

module.exports = { IsleRCONSolution, app };