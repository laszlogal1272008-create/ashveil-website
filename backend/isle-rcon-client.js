// ================================================
// THE ISLE SPECIFIC RCON CLIENT
// ================================================
// Enhanced RCON client specifically designed for The Isle servers
// Handles proper handshake, authentication, and command protocols
// ================================================

const net = require('net');
const EventEmitter = require('events');

class IsleRCONClient extends EventEmitter {
    constructor(config) {
        super();
        
        this.config = {
            host: config.host || '45.45.238.134',
            port: config.port || 16007,
            password: config.password || 'CookieMonster420',
            timeout: config.timeout || 15000,
            reconnectDelay: config.reconnectDelay || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10
        };
        
        this.socket = null;
    this.buffer = Buffer.alloc(0);
        this.isConnected = false;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.requestId = 1;
        this.pendingRequests = new Map();
        this.lastError = null;
        
        // RCON Protocol Constants
        this.PACKET_TYPES = {
            SERVERDATA_AUTH: 3,
            SERVERDATA_AUTH_RESPONSE: 2,
            SERVERDATA_EXECCOMMAND: 2,
            SERVERDATA_RESPONSE_VALUE: 0
        };
        
        console.log('🦕 Isle RCON Client initialized');
        console.log(`📡 Target: ${this.config.host}:${this.config.port}`);
    }
    
    // ================================================
    // CONNECTION MANAGEMENT
    // ================================================
    
    async connect() {
        if (this.isConnected || this.isConnecting) {
            console.log('⚠️  Already connected or connecting');
            return false;
        }
        
        this.isConnecting = true;
        
        return new Promise((resolve, reject) => {
            console.log(`🔌 Connecting to Isle server ${this.config.host}:${this.config.port}...`);
            
            const timeout = setTimeout(() => {
                // Timeout waiting for TCP connect/auth sequence
                this.cleanup();
                const err = new Error('Connection timeout - server may not be responding');
                this.handleError(err);
                reject(err);
            }, this.config.timeout);
            
            this.socket = new net.Socket();
            // Ensure quick packet transmission
            this.socket.setNoDelay(true);

            // Set an idle timeout for the socket - will be refreshed on auth
            this.socket.setTimeout(this.config.timeout);
            
            // Connection established
            this.socket.on('connect', () => {
                console.log('🔗 TCP connection established, starting authentication...');
                // Clear connect-level timeout
                clearTimeout(timeout);
                // Reset internal receive buffer
                this.buffer = Buffer.alloc(0);

                // Small delay before sending auth in case server needs to finish setup
                setTimeout(() => this.startAuthentication(), 50);
            });
            
            // Data received - may come fragmented or combined; buffer and parse
            this.socket.on('data', (data) => {
                // Reset socket idle timeout whenever we receive data
                try { this.socket.setTimeout(this.config.timeout); } catch (e) {}
                this.buffer = Buffer.concat([this.buffer, data]);
                this.handleBufferedData();
            });

            // Socket idle timeout
            this.socket.on('timeout', () => {
                const err = new Error('Socket idle timeout');
                console.error('⏰ Socket timeout:', err.message);
                this.handleError(err);
                this.cleanup();
            });
            
            // Connection closed
            this.socket.on('close', (hadError) => {
                console.log('🔌 Connection closed', hadError ? '(had error)' : '');
                this.handleDisconnection();
            });
            
            // Connection error
            this.socket.on('error', (error) => {
                console.error('❌ Socket error:', error.message);
                clearTimeout(timeout);
                this.handleError(error);
                reject(error);
            });
            
            // Handle authentication success/failure
            this.once('authenticated', () => {
                this.isConnected = true;
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                console.log('✅ RCON authentication successful');
                resolve(true);
            });
            
            this.once('authFailed', (error) => {
                this.cleanup();
                reject(new Error(`Authentication failed: ${error}`));
            });
            
            // Initiate connection
            this.socket.connect(this.config.port, this.config.host);
        });
    }
    
    startAuthentication() {
        console.log('🔐 Sending authentication request...');
        
        const authPacket = this.createPacket(
            this.getNextRequestId(),
            this.PACKET_TYPES.SERVERDATA_AUTH,
            this.config.password
        );
        
        // Write with error handling
        this.socket.write(authPacket, (err) => {
            if (err) {
                console.error('❌ Failed to send auth packet:', err.message);
                this.handleError(err);
            } else {
                console.log('🔐 Auth packet sent');
            }
        });
    }

    // Handle buffered incoming data and parse complete RCON packets
    handleBufferedData() {
        try {
            let offset = 0;

            while (this.buffer.length >= 4) {
                // Peek size
                const size = this.buffer.readInt32LE(0);

                // Sanity check for size
                if (size <= 0 || size > 10 * 1024 * 1024) {
                    throw new Error(`Invalid packet size: ${size}`);
                }

                // Full packet length includes the initial size field (4 bytes) + size
                if (this.buffer.length < size + 4) {
                    // wait for more data
                    // console.log('📦 Waiting for full packet...');
                    break;
                }

                // Now we have a complete packet
                const id = this.buffer.readInt32LE(4);
                const type = this.buffer.readInt32LE(8);

                // Body starts at offset 12, length = size - 8 (id+type)
                const bodyLength = size - 8;
                const bodyStart = 12;
                const bodyEnd = bodyStart + bodyLength;

                // Extract body and strip trailing two null bytes if present
                let bodyBuf = this.buffer.slice(bodyStart, Math.min(bodyEnd, this.buffer.length));
                if (bodyBuf.length >= 2 && bodyBuf[bodyBuf.length - 1] === 0x00 && bodyBuf[bodyBuf.length - 2] === 0x00) {
                    bodyBuf = bodyBuf.slice(0, bodyBuf.length - 2);
                }

                const response = bodyBuf.toString('ascii');

                console.log(`📨 Received packet: ID=${id}, Type=${type}, Size=${size}, Response="${response}"`);

                this.handlePacket(id, type, response);

                // Remove processed packet from buffer
                this.buffer = this.buffer.slice(size + 4);
            }

        } catch (error) {
            console.error('❌ Error parsing buffered RCON data:', error);
            this.handleError(error);
        }
    }
    
    handlePacket(id, type, response) {
        switch (type) {
            case this.PACKET_TYPES.SERVERDATA_AUTH_RESPONSE:
                if (id === -1) {
                    this.emit('authFailed', 'Invalid password');
                } else {
                    this.emit('authenticated');
                }
                break;
                
            case this.PACKET_TYPES.SERVERDATA_RESPONSE_VALUE:
                const request = this.pendingRequests.get(id);
                if (request) {
                    clearTimeout(request.timeout);
                    this.pendingRequests.delete(id);
                    request.resolve(response);
                } else {
                    console.log(`📨 Received response for unknown request ID: ${id}`);
                }
                break;
                
            default:
                console.log(`📨 Unknown packet type: ${type}`);
                break;
        }
    }
    
    handleDisconnection() {
        const wasConnected = this.isConnected;
        this.isConnected = false;
        this.isConnecting = false;
        
        // Clear all pending requests
        this.pendingRequests.forEach((request) => {
            clearTimeout(request.timeout);
            request.reject(new Error('Connection lost'));
        });
        this.pendingRequests.clear();
        
        this.emit('disconnected');
        
        if (wasConnected && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.attemptReconnection();
        }
    }
    
    handleError(error) {
        this.lastError = {
            message: error.message,
            timestamp: new Date().toISOString(),
            code: error.code || 'UNKNOWN'
        };
        
        // Don't emit error for timeout - just log and reconnect
        if (error.message.includes('timeout')) {
            console.log('⚠️  RCON timeout - will attempt reconnection');
            this.attemptReconnection();
        } else {
            this.emit('error', error);
        }
    }
    
    async attemptReconnection() {
        if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
            console.error(`❌ Max reconnection attempts reached (${this.config.maxReconnectAttempts})`);
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}...`);
        
        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                console.error('❌ Reconnection failed:', error.message);
            }
        }, this.config.reconnectDelay);
    }
    
    // ================================================
    // COMMAND EXECUTION
    // ================================================
    
    async executeCommand(command, timeout = 10000) {
        if (!this.isConnected) {
            throw new Error('Not connected to RCON server');
        }
        
        const requestId = this.getNextRequestId();
        console.log(`📤 Executing command [${requestId}]: ${command}`);
        
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error('Command timeout'));
            }, timeout);
            
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                timeout: timeoutHandle,
                command,
                timestamp: Date.now()
            });
            
            const packet = this.createPacket(
                requestId,
                this.PACKET_TYPES.SERVERDATA_EXECCOMMAND,
                command
            );
            
            this.socket.write(packet);
        });
    }
    
    // ================================================
    // THE ISLE SPECIFIC COMMANDS
    // ================================================
    
    async getPlayerList() {
        try {
            const response = await this.executeCommand('list');
            return this.parsePlayerList(response);
        } catch (error) {
            console.error('Failed to get player list:', error);
            return [];
        }
    }
    
    async slayPlayer(playerName) {
        try {
            // The Isle uses KillCharacter command for slaying
            const response = await this.executeCommand(`KillCharacter ${playerName}`);
            return {
                success: true,
                playerName,
                response,
                message: `Successfully slayed ${playerName}'s character`
            };
        } catch (error) {
            return {
                success: false,
                playerName,
                error: error.message,
                message: `Failed to slay ${playerName}: ${error.message}`
            };
        }
    }
    
    async kickPlayer(playerName, reason = 'Kicked by admin') {
        try {
            const response = await this.executeCommand(`Kick ${playerName} ${reason}`);
            return {
                success: true,
                playerName,
                reason,
                response
            };
        } catch (error) {
            throw new Error(`Failed to kick ${playerName}: ${error.message}`);
        }
    }
    
    async banPlayer(playerName, reason = 'Banned by admin') {
        try {
            const response = await this.executeCommand(`Ban ${playerName} ${reason}`);
            return {
                success: true,
                playerName,
                reason,
                response
            };
        } catch (error) {
            throw new Error(`Failed to ban ${playerName}: ${error.message}`);
        }
    }
    
    async sendMessage(message) {
        try {
            const response = await this.executeCommand(`Say ${message}`);
            return {
                success: true,
                message,
                response
            };
        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }
    
    async getServerInfo() {
        try {
            const response = await this.executeCommand('info');
            return this.parseServerInfo(response);
        } catch (error) {
            console.error('Failed to get server info:', error);
            return null;
        }
    }
    
    // ================================================
    // RESPONSE PARSING
    // ================================================
    
    parsePlayerList(response) {
        const players = [];
        if (!response || typeof response !== 'string') {
            return players;
        }
        
        const lines = response.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            // Parse The Isle player list format
            // Example: "PlayerName (SteamID64) - Species"
            const match = line.match(/^(.+?)\s*\((\d{17})\)\s*-\s*(.+)$/);
            if (match) {
                players.push({
                    name: match[1].trim(),
                    steamId: match[2],
                    species: match[3].trim(),
                    online: true
                });
            }
        }
        
        return players;
    }
    
    parseServerInfo(response) {
        if (!response || typeof response !== 'string') {
            return null;
        }
        
        const info = {
            raw: response
        };
        
        // Parse common server info fields
        const lines = response.split('\n');
        for (const line of lines) {
            const match = line.match(/^(.+?):\s*(.+)$/);
            if (match) {
                const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
                info[key] = match[2].trim();
            }
        }
        
        return info;
    }
    
    // ================================================
    // PACKET CREATION
    // ================================================
    
    createPacket(id, type, body) {
        const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
        const size = bodyBuffer.length + 8; // Add 8 bytes for ID and Type
        
        const packet = Buffer.allocUnsafe(4 + size);
        let offset = 0;
        
        // Write size
        packet.writeInt32LE(size, offset);
        offset += 4;
        
        // Write ID
        packet.writeInt32LE(id, offset);
        offset += 4;
        
        // Write type
        packet.writeInt32LE(type, offset);
        offset += 4;
        
        // Write body
        bodyBuffer.copy(packet, offset);
        
        return packet;
    }
    
    getNextRequestId() {
        return this.requestId++;
    }
    
    // ================================================
    // UTILITY METHODS
    // ================================================
    
    cleanup() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.destroy();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.isConnecting = false;
        
        // Clear pending requests
        this.pendingRequests.forEach((request) => {
            clearTimeout(request.timeout);
            request.reject(new Error('Connection cleanup'));
        });
        this.pendingRequests.clear();
    }
    
    disconnect() {
        console.log('🛑 Disconnecting from Isle RCON...');
        this.config.maxReconnectAttempts = 0; // Prevent reconnection
        this.cleanup();
    }
    
    getStatus() {
        return {
            connected: this.isConnected,
            connecting: this.isConnecting,
            reconnectAttempts: this.reconnectAttempts,
            lastError: this.lastError,
            pendingRequests: this.pendingRequests.size,
            config: {
                host: this.config.host,
                port: this.config.port
            }
        };
    }
}

module.exports = IsleRCONClient;

// ================================================
// USAGE EXAMPLE
// ================================================

/*

const IsleRCONClient = require('./isle-rcon-client');

const client = new IsleRCONClient({
    host: '45.45.238.134',
    port: 16007,
    password: 'CookieMonster420',
    timeout: 15000
});

// Event handlers
client.on('authenticated', () => {
    console.log('🎮 Ready to execute commands');
});

client.on('disconnected', () => {
    console.log('🔌 Lost connection to server');
});

client.on('error', (error) => {
    console.error('❌ RCON Error:', error.message);
});

// Connect and use
async function main() {
    try {
        await client.connect();
        
        // Get player list
        const players = await client.getPlayerList();
        console.log('Online players:', players);
        
        // Slay a player
        const slayResult = await client.slayPlayer('TestPlayer');
        console.log('Slay result:', slayResult);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// main();

*/