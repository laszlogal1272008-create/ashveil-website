#!/usr/bin/env node

/**
 * 🧪 Test Austin's Exact RCON Authentication Method
 * Based on the TheIsleEvrimaRcon C# implementation
 */

const net = require('net');

const SERVER_HOST = '45.45.238.134';
const SERVER_PORT = 16007;
const PASSWORD = 'CookieMonster420';

// RCON packet types (from Source RCON protocol)
const SERVERDATA_AUTH = 3;
const SERVERDATA_AUTH_RESPONSE = 2;
const SERVERDATA_EXECCOMMAND = 2;
const SERVERDATA_RESPONSE_VALUE = 0;

console.log('🎯 Testing Austin\'s exact RCON method...');
console.log(`📡 Target: ${SERVER_HOST}:${SERVER_PORT}`);
console.log(`🔐 Password: ${PASSWORD}`);

class AustinRCONTest {
    constructor() {
        this.socket = null;
        this.requestId = 1;
        this.authId = 0;
        this.isAuthenticated = false;
        this.buffer = Buffer.alloc(0);
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log('🔌 Creating TCP connection...');
            
            this.socket = new net.Socket();
            this.socket.setTimeout(10000); // 10 second timeout like Austin's app

            this.socket.on('connect', () => {
                console.log('✅ TCP connection established');
                
                // Send auth immediately after connection like C# app
                this.sendAuthPacket();
            });

            this.socket.on('data', (data) => {
                this.buffer = Buffer.concat([this.buffer, data]);
                this.processBuffer();
            });

            this.socket.on('timeout', () => {
                console.log('⏰ Connection timeout');
                reject(new Error('Connection timeout'));
            });

            this.socket.on('error', (err) => {
                console.log('❌ Socket error:', err.message);
                reject(err);
            });

            this.socket.on('close', () => {
                console.log('🔌 Connection closed');
                if (!this.isAuthenticated) {
                    reject(new Error('Connection closed before auth'));
                }
            });

            // Start the connection
            this.socket.connect(SERVER_PORT, SERVER_HOST);

            // Resolve when authenticated
            this.socket.on('authenticated', () => {
                resolve();
            });
        });
    }

    sendAuthPacket() {
        this.authId = this.getNextId();
        console.log(`🔐 Sending auth packet (ID: ${this.authId})...`);
        
        const packet = this.createPacket(this.authId, SERVERDATA_AUTH, PASSWORD);
        this.socket.write(packet);
    }

    processBuffer() {
        while (this.buffer.length >= 4) {
            // Read packet size
            const size = this.buffer.readInt32LE(0);
            
            if (this.buffer.length < 4 + size) {
                // Not enough data for complete packet
                break;
            }

            // Extract the packet
            const packetData = this.buffer.slice(4, 4 + size);
            this.buffer = this.buffer.slice(4 + size);

            this.handlePacket(packetData);
        }
    }

    handlePacket(data) {
        if (data.length < 8) {
            console.log('⚠️  Malformed packet (too short)');
            return;
        }

        const id = data.readInt32LE(0);
        const type = data.readInt32LE(4);
        const body = data.slice(8, data.length - 2).toString('ascii');

        console.log(`📦 Received packet - ID: ${id}, Type: ${type}, Body: "${body}"`);

        if (type === SERVERDATA_AUTH_RESPONSE) {
            if (id === this.authId) {
                console.log('✅ Authentication successful!');
                this.isAuthenticated = true;
                this.socket.emit('authenticated');
                
                // Test a command
                this.sendCommand('help');
            } else {
                console.log('❌ Authentication failed - ID mismatch');
            }
        } else if (type === SERVERDATA_RESPONSE_VALUE) {
            console.log(`📝 Command response: ${body}`);
        }
    }

    sendCommand(command) {
        if (!this.isAuthenticated) {
            console.log('⚠️  Not authenticated, cannot send command');
            return;
        }

        const cmdId = this.getNextId();
        console.log(`⚡ Sending command "${command}" (ID: ${cmdId})...`);
        
        const packet = this.createPacket(cmdId, SERVERDATA_EXECCOMMAND, command);
        this.socket.write(packet);
    }

    createPacket(id, type, body) {
        const bodyBuffer = Buffer.from(body + '\x00\x00', 'ascii');
        const size = bodyBuffer.length + 8; // ID (4) + Type (4) + Body + Null terminators (2)
        
        const packet = Buffer.allocUnsafe(4 + size);
        let offset = 0;
        
        // Write size (excluding the size field itself)
        packet.writeInt32LE(size, offset);
        offset += 4;
        
        // Write ID
        packet.writeInt32LE(id, offset);
        offset += 4;
        
        // Write type
        packet.writeInt32LE(type, offset);
        offset += 4;
        
        // Write body (includes null terminators)
        bodyBuffer.copy(packet, offset);
        
        return packet;
    }

    getNextId() {
        return this.requestId++;
    }

    disconnect() {
        if (this.socket) {
            this.socket.end();
        }
    }
}

// Run the test
async function runTest() {
    const client = new AustinRCONTest();
    
    try {
        await client.connect();
        console.log('🎉 SUCCESS! Authentication worked using Austin\'s method');
        
        // Keep connection alive for a moment to see responses
        setTimeout(() => {
            client.disconnect();
            process.exit(0);
        }, 3000);
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        client.disconnect();
        process.exit(1);
    }
}

runTest();